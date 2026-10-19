"""Compile and run GLSL ES 3.00 fragment shaders the way ComfyUI's GLSLShader node does (EGL + ANGLE),
on a numpy image. My own harness, written from reading comfy_extras/nodes_glsl.py at the pinned commit.

Usage: python glsl_run.py <shader.frag> <in.png> <out.png> [--floats a,b,..] [--ints a,..] [--bools 0,1,..]
"""
import argparse, ctypes, os, sys
import numpy as np
import comfy_angle

angle_dir = comfy_angle.get_lib_dir()
os.add_dll_directory(angle_dir)
os.environ['PATH'] = angle_dir + os.pathsep + os.environ.get('PATH', '')
ctypes.CDLL(str(comfy_angle.get_egl_path()))
ctypes.CDLL(str(comfy_angle.get_glesv2_path()))
os.environ.setdefault('PYOPENGL_PLATFORM', 'egl')
import ctypes.util
_orig = ctypes.util.find_library
ctypes.util.find_library = lambda n: comfy_angle.get_egl_path() if n == 'EGL' else comfy_angle.get_glesv2_path() if n == 'GLESv2' else _orig(n)
import OpenGL
OpenGL.USE_ACCELERATE = False
from OpenGL import EGL
from OpenGL import GLES3 as gl
from PIL import Image

VERTEX = """#version 300 es
out vec2 v_texCoord;
void main() {
    vec2 verts[3] = vec2[](vec2(-1, -1), vec2(3, -1), vec2(-1, 3));
    v_texCoord = verts[gl_VertexID] * 0.5 + 0.5;
    gl_Position = vec4(verts[gl_VertexID], 0, 1);
}
"""

def attribs(*v):
    v = list(v) + [EGL.EGL_NONE]
    return (ctypes.c_int32 * len(v))(*v)

def context():
    d = EGL.eglGetDisplay(EGL.EGL_DEFAULT_DISPLAY)
    ma, mi = ctypes.c_int32(), ctypes.c_int32()
    assert EGL.eglInitialize(d, ctypes.byref(ma), ctypes.byref(mi))
    assert EGL.eglBindAPI(EGL.EGL_OPENGL_ES_API)
    cfg = EGL.EGLConfig(); n = ctypes.c_int32()
    assert EGL.eglChooseConfig(d, attribs(EGL.EGL_RENDERABLE_TYPE, EGL.EGL_OPENGL_ES3_BIT, EGL.EGL_SURFACE_TYPE, EGL.EGL_PBUFFER_BIT,
                                          EGL.EGL_RED_SIZE, 8, EGL.EGL_GREEN_SIZE, 8, EGL.EGL_BLUE_SIZE, 8, EGL.EGL_ALPHA_SIZE, 8), ctypes.byref(cfg), 1, ctypes.byref(n))
    s = EGL.eglCreatePbufferSurface(d, cfg, attribs(EGL.EGL_WIDTH, 64, EGL.EGL_HEIGHT, 64))
    c = EGL.eglCreateContext(d, cfg, EGL.EGL_NO_CONTEXT, attribs(EGL.EGL_CONTEXT_CLIENT_VERSION, 3))
    assert EGL.eglMakeCurrent(d, s, s, c)
    vao = gl.glGenVertexArrays(1); gl.glBindVertexArray(vao)
    print('GL', gl.glGetString(gl.GL_VERSION), gl.glGetString(gl.GL_RENDERER))

def compile_(src, kind):
    sh = gl.glCreateShader(kind); gl.glShaderSource(sh, src); gl.glCompileShader(sh)
    if not gl.glGetShaderiv(sh, gl.GL_COMPILE_STATUS):
        raise SystemExit('COMPILE FAILED:\n' + str(gl.glGetShaderInfoLog(sh)))
    return sh

def run(frag, img, floats, ints, bools):
    h, w, _ = img.shape
    prog = gl.glCreateProgram()
    gl.glAttachShader(prog, compile_(VERTEX, gl.GL_VERTEX_SHADER))
    gl.glAttachShader(prog, compile_(frag, gl.GL_FRAGMENT_SHADER))
    gl.glLinkProgram(prog)
    if not gl.glGetProgramiv(prog, gl.GL_LINK_STATUS):
        raise SystemExit('LINK FAILED:\n' + str(gl.glGetProgramInfoLog(prog)))
    gl.glUseProgram(prog)
    fbo = gl.glGenFramebuffers(1); gl.glBindFramebuffer(gl.GL_FRAMEBUFFER, fbo)
    out = gl.glGenTextures(1); gl.glBindTexture(gl.GL_TEXTURE_2D, out)
    gl.glTexImage2D(gl.GL_TEXTURE_2D, 0, gl.GL_RGBA32F, w, h, 0, gl.GL_RGBA, gl.GL_FLOAT, None)
    gl.glFramebufferTexture2D(gl.GL_FRAMEBUFFER, gl.GL_COLOR_ATTACHMENT0, gl.GL_TEXTURE_2D, out, 0)
    gl.glDrawBuffers(1, [gl.GL_COLOR_ATTACHMENT0])
    assert gl.glCheckFramebufferStatus(gl.GL_FRAMEBUFFER) == gl.GL_FRAMEBUFFER_COMPLETE
    tex = gl.glGenTextures(1); gl.glActiveTexture(gl.GL_TEXTURE0); gl.glBindTexture(gl.GL_TEXTURE_2D, tex)
    for p, v in ((gl.GL_TEXTURE_MIN_FILTER, gl.GL_LINEAR), (gl.GL_TEXTURE_MAG_FILTER, gl.GL_LINEAR), (gl.GL_TEXTURE_WRAP_S, gl.GL_CLAMP_TO_EDGE), (gl.GL_TEXTURE_WRAP_T, gl.GL_CLAMP_TO_EDGE)):
        gl.glTexParameteri(gl.GL_TEXTURE_2D, p, v)
    up = np.ones((h, w, 4), np.float32); up[:, :, :3] = img[::-1]
    gl.glTexImage2D(gl.GL_TEXTURE_2D, 0, gl.GL_RGBA32F, w, h, 0, gl.GL_RGBA, gl.GL_FLOAT, up)
    loc = gl.glGetUniformLocation(prog, 'u_image0'); loc >= 0 and gl.glUniform1i(loc, 0)
    loc = gl.glGetUniformLocation(prog, 'u_resolution'); loc >= 0 and gl.glUniform2f(loc, float(w), float(h))
    for i, v in enumerate(floats):
        loc = gl.glGetUniformLocation(prog, f'u_float{i}'); loc >= 0 and gl.glUniform1f(loc, v)
    for i, v in enumerate(ints):
        loc = gl.glGetUniformLocation(prog, f'u_int{i}'); loc >= 0 and gl.glUniform1i(loc, v)
    for i, v in enumerate(bools):
        loc = gl.glGetUniformLocation(prog, f'u_bool{i}'); loc >= 0 and gl.glUniform1i(loc, 1 if v else 0)
    gl.glViewport(0, 0, w, h); gl.glDisable(gl.GL_BLEND)
    gl.glClearColor(0, 0, 0, 0); gl.glClear(gl.GL_COLOR_BUFFER_BIT)
    gl.glDrawArrays(gl.GL_TRIANGLES, 0, 3)
    gl.glReadBuffer(gl.GL_COLOR_ATTACHMENT0)
    buf = np.empty((h, w, 4), np.float32)
    gl.glReadPixels(0, 0, w, h, gl.GL_RGBA, gl.GL_FLOAT, buf)
    return buf[::-1].copy()

if __name__ == '__main__':
    a = argparse.ArgumentParser()
    a.add_argument('frag'); a.add_argument('inp'); a.add_argument('out')
    a.add_argument('--floats', default=''); a.add_argument('--ints', default=''); a.add_argument('--bools', default='')
    o = a.parse_args()
    nums = lambda s, f: [f(x) for x in s.split(',') if x != '']
    context()
    img = np.asarray(Image.open(o.inp).convert('RGB'), np.float32) / 255.0
    res = run(open(o.frag, encoding='utf-8').read(), img, nums(o.floats, float), nums(o.ints, int), nums(o.bools, int))
    Image.fromarray((np.clip(res[:, :, :3], 0, 1) * 255 + 0.5).astype(np.uint8)).save(o.out)
    print('ok', res.shape, 'alpha min/max', float(res[:, :, 3].min()), float(res[:, :, 3].max()), 'mean rgb', res[:, :, :3].mean(axis=(0, 1)))
