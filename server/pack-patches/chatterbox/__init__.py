# Patched copy of __init__.py from filliptm/ComfyUI_Fill-ChatterBox at
# f7d7a16187430abcaf91a3039b9c83aa9960816a. ComfyField's change: a node that catches its own error returns
# one sample of silence and its message, and ComfyUI counts that as a success. A graph that feeds that
# audio on (InfiniteTalk's wav2vec2) then fails with an unrelated error. The wrapper below raises the
# node's message instead, so the run fails where the voice failed. The pack's banner is left out.
# The Pod writes this over the pack's file when it installs the pack.
import functools

from .chatterbox_node import NODE_CLASS_MAPPINGS as BASE_CLASS_MAPPINGS, NODE_DISPLAY_NAME_MAPPINGS as BASE_DISPLAY_NAME_MAPPINGS
from .chatterbox_dialog_node import NODE_CLASS_MAPPINGS as DIALOG_CLASS_MAPPINGS, NODE_DISPLAY_NAME_MAPPINGS as DIALOG_DISPLAY_NAME_MAPPINGS

NODE_CLASS_MAPPINGS = {}
NODE_CLASS_MAPPINGS.update(BASE_CLASS_MAPPINGS)
NODE_CLASS_MAPPINGS.update(DIALOG_CLASS_MAPPINGS)

NODE_DISPLAY_NAME_MAPPINGS = {}
NODE_DISPLAY_NAME_MAPPINGS.update(BASE_DISPLAY_NAME_MAPPINGS)
NODE_DISPLAY_NAME_MAPPINGS.update(DIALOG_DISPLAY_NAME_MAPPINGS)

WEB_DIRECTORY = "./web"
__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]


def _no_sound(result):
    if not isinstance(result, tuple) or not result or not isinstance(result[0], dict):
        return False
    waveform = result[0].get("waveform")
    return waveform is not None and waveform.shape[-1] <= 1


def _raise_on_silence(fn):
    @functools.wraps(fn)
    def run(*args, **kwargs):
        result = fn(*args, **kwargs)
        if _no_sound(result):
            message = result[1] if len(result) > 1 and isinstance(result[1], str) else ""
            lines = [l for l in message.splitlines() if "rror" in l] or message.splitlines()[-1:]
            raise RuntimeError("Chatterbox returned no sound. " + (lines[-1].strip() if lines else ""))
        return result
    return run


for _cls in NODE_CLASS_MAPPINGS.values():
    _name = getattr(_cls, "FUNCTION", None)
    if _name and "AUDIO" in getattr(_cls, "RETURN_TYPES", ()) and hasattr(_cls, _name):
        setattr(_cls, _name, _raise_on_silence(getattr(_cls, _name)))
