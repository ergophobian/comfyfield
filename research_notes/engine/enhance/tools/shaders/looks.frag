#version 300 es
precision highp float;

// ComfyField photo-grade looks. One bool per look; all false is Natural (no change).
uniform sampler2D u_image0;
uniform vec2 u_resolution;
uniform bool u_bool0; // split_tone: teal shadows, warm highlights
uniform bool u_bool1; // soft_skin: gentle glow, softer contrast
uniform bool u_bool2; // old_lens: halation glow and vignette
uniform bool u_bool3; // 16mm: lifted blacks, softer colour (grain comes from the grain pass)
uniform bool u_bool4; // faded: matte blacks, rolled highlights, washed colour
uniform bool u_bool5; // mono: punchy black and white
uniform bool u_bool6; // warm_70s: golden, soft, lifted

in vec2 v_texCoord;
layout(location = 0) out vec4 fragColor0;

const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);

float luma(vec3 c) { return dot(c, LUMA); }
vec3 contrast(vec3 c, float k) { return (c - 0.5) * k + 0.5; }
vec3 lift(vec3 c, float l) { return c * (1.0 - l) + l; }
vec3 sat(vec3 c, float s) { return mix(vec3(luma(c)), c, s); }

// 16-tap golden-angle disc blur of the source, radius in pixels.
vec3 blur(vec2 uv, float radiusPx) {
    vec2 px = radiusPx / u_resolution;
    vec3 acc = texture(u_image0, uv).rgb;
    float wsum = 1.0;
    for (int i = 0; i < 16; i++) {
        float a = float(i) * 2.3999632;
        float r = sqrt((float(i) + 0.5) / 16.0);
        float w = 1.0 - 0.5 * r;
        acc += texture(u_image0, uv + vec2(cos(a), sin(a)) * r * px).rgb * w;
        wsum += w;
    }
    return acc / wsum;
}

float vignette(vec2 uv, float strength) {
    float aspect = u_resolution.x / u_resolution.y;
    vec2 d = (uv - 0.5) * vec2(aspect, 1.0);
    float r = length(d) / length(vec2(aspect, 1.0) * 0.5);
    return 1.0 - strength * smoothstep(0.35, 1.0, r);
}

void main() {
    vec4 tex = texture(u_image0, v_texCoord);
    vec3 c = tex.rgb;
    float shortSide = min(u_resolution.x, u_resolution.y);

    if (u_bool0) {
        float l = luma(c);
        float sh = 1.0 - smoothstep(0.05, 0.55, l);
        float hi = smoothstep(0.45, 0.95, l);
        c += sh * vec3(-0.05, 0.015, 0.06) + hi * vec3(0.06, 0.025, -0.045);
        c = contrast(c, 1.06);
    }
    if (u_bool1) {
        vec3 b = blur(v_texCoord, shortSide * 0.006);
        c = mix(c, max(c, b), 0.35);
        c = contrast(c, 0.93);
        c = lift(c, 0.02);
        c += vec3(0.015, 0.005, -0.01);
        c = sat(c, 0.95);
    }
    if (u_bool2) {
        vec3 b = blur(v_texCoord, shortSide * 0.012);
        c += b * smoothstep(0.55, 1.0, luma(b)) * 0.35;
        c = mix(c, b, 0.15);
        c *= vignette(v_texCoord, 0.45);
        c = sat(c, 0.9);
        c += vec3(0.01, 0.0, -0.01);
    }
    if (u_bool3) {
        float l = luma(c);
        c = lift(c, 0.06);
        c += (1.0 - smoothstep(0.0, 0.5, l)) * vec3(0.0, 0.015, -0.01);
        c = contrast(c, 1.04);
        c = sat(c, 0.85);
        c *= vignette(v_texCoord, 0.2);
    }
    if (u_bool4) {
        c = mix(vec3(0.10, 0.10, 0.11), vec3(0.93, 0.92, 0.90), clamp(c, 0.0, 1.0));
        c = sat(c, 0.72);
    }
    if (u_bool5) {
        float l = clamp(dot(c, vec3(0.30, 0.59, 0.11)), 0.0, 1.0);
        l = mix(l, l * l * (3.0 - 2.0 * l), 0.6);
        l = (l - 0.5) * 1.12 + 0.5;
        c = vec3(l);
    }
    if (u_bool6) {
        c += vec3(0.06, 0.025, -0.05);
        c = lift(c, 0.04);
        c = contrast(c, 0.95);
        c = sat(c, 0.9);
        vec3 b = blur(v_texCoord, shortSide * 0.008);
        c = mix(c, max(c, b), 0.2);
    }
    fragColor0 = vec4(clamp(c, 0.0, 1.0), tex.a);
}
