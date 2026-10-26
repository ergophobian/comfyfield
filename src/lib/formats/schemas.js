// Public fal/Router schemas and bundled Comfy placeholders. Refresh with node scripts/format-schemas.mjs.
export const schemas = {
  "fal": {
    "fal-ai/flux-pro/v1/fill": {
      "properties": {
        "mask_url": {
          "type": "string"
        },
        "sync_mode": {
          "type": "boolean",
          "default": false
        },
        "image_url": {
          "type": "string"
        },
        "seed": {
          "type": "integer"
        },
        "enhance_prompt": {
          "type": "boolean",
          "default": false
        },
        "output_format": {
          "type": "string",
          "enum": [
            "jpeg",
            "png"
          ],
          "default": "jpeg"
        },
        "num_images": {
          "type": "integer",
          "default": 1
        },
        "safety_tolerance": {
          "type": "string",
          "enum": [
            "1",
            "2",
            "3",
            "4",
            "5",
            "6"
          ],
          "default": "2"
        },
        "prompt": {
          "type": "string"
        }
      },
      "required": [
        "prompt",
        "image_url",
        "mask_url"
      ]
    },
    "fal-ai/nano-banana-2/edit": {
      "properties": {
        "limit_generations": {
          "type": "boolean",
          "default": true
        },
        "sync_mode": {
          "type": "boolean",
          "default": false
        },
        "resolution": {
          "type": "string",
          "enum": [
            "0.5K",
            "1K",
            "2K",
            "4K"
          ],
          "default": "1K"
        },
        "aspect_ratio": {
          "type": "string",
          "enum": [
            "auto",
            "21:9",
            "16:9",
            "3:2",
            "4:3",
            "5:4",
            "1:1",
            "4:5",
            "3:4",
            "2:3",
            "9:16",
            "4:1",
            "1:4",
            "8:1",
            "1:8"
          ],
          "default": "auto"
        },
        "safety_tolerance": {
          "type": "string",
          "enum": [
            "1",
            "2",
            "3",
            "4",
            "5",
            "6"
          ],
          "default": "4"
        },
        "video_url": {
          "type": "string"
        },
        "enable_web_search": {
          "type": "boolean",
          "default": false
        },
        "system_prompt": {
          "type": "string",
          "default": ""
        },
        "num_images": {
          "type": "integer",
          "default": 1
        },
        "output_format": {
          "type": "string",
          "enum": [
            "jpeg",
            "png",
            "webp"
          ],
          "default": "png"
        },
        "pdf_url": {
          "type": "string"
        },
        "prompt": {
          "type": "string"
        },
        "audio_url": {
          "type": "string"
        },
        "seed": {
          "type": "integer"
        },
        "image_urls": {
          "type": "array"
        },
        "thinking_level": {
          "type": "string",
          "enum": [
            "minimal",
            "high"
          ]
        }
      },
      "required": [
        "prompt"
      ]
    },
    "bytedance/seedance-2.0/fast/image-to-video": {
      "properties": {
        "bitrate_mode": {
          "type": "string",
          "enum": [
            "standard",
            "high"
          ],
          "default": "standard"
        },
        "aspect_ratio": {
          "type": "string",
          "enum": [
            "auto",
            "21:9",
            "16:9",
            "4:3",
            "1:1",
            "3:4",
            "9:16"
          ],
          "default": "auto"
        },
        "image_url": {
          "type": "string"
        },
        "end_user_id": {
          "type": "string"
        },
        "codec": {
          "type": "string",
          "enum": [
            "auto",
            "H264",
            "H265"
          ],
          "default": "auto"
        },
        "duration": {
          "type": "string",
          "enum": [
            "auto",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
            "11",
            "12",
            "13",
            "14",
            "15"
          ],
          "default": "auto"
        },
        "end_image_url": {
          "type": "string"
        },
        "prompt": {
          "type": "string"
        },
        "resolution": {
          "type": "string",
          "enum": [
            "480p",
            "720p"
          ],
          "default": "720p"
        },
        "generate_audio": {
          "type": "boolean",
          "default": true
        }
      },
      "required": [
        "prompt",
        "image_url"
      ]
    },
    "fal-ai/kling-video/v3/standard/image-to-video": {
      "properties": {
        "generate_audio": {
          "type": "boolean",
          "default": true
        },
        "negative_prompt": {
          "type": "string",
          "default": "blur, distort, and low quality"
        },
        "cfg_scale": {
          "type": "number",
          "default": 0.5
        },
        "start_image_url": {
          "type": "string"
        },
        "end_image_url": {
          "type": "string"
        },
        "prompt": {
          "type": "string"
        },
        "enable_safety_checker": {
          "type": "boolean",
          "default": true
        },
        "shot_type": {
          "type": "string",
          "enum": [
            "customize",
            "intelligent"
          ],
          "default": "customize"
        },
        "elements": {
          "type": "array"
        },
        "multi_prompt": {
          "type": "array"
        },
        "duration": {
          "type": "string",
          "enum": [
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
            "11",
            "12",
            "13",
            "14",
            "15"
          ],
          "default": "5"
        }
      },
      "required": [
        "start_image_url"
      ]
    },
    "fal-ai/qwen-image-edit-2511-multiple-angles": {
      "properties": {
        "zoom": {
          "type": "number",
          "default": 5
        },
        "horizontal_angle": {
          "type": "number",
          "default": 0
        },
        "lora_scale": {
          "type": "number",
          "default": 1
        },
        "vertical_angle": {
          "type": "number",
          "default": 0
        },
        "image_urls": {
          "type": "array"
        },
        "num_inference_steps": {
          "type": "integer",
          "default": 28
        },
        "additional_prompt": {
          "type": "string"
        },
        "output_format": {
          "type": "string",
          "enum": [
            "png",
            "jpeg",
            "webp"
          ],
          "default": "png"
        },
        "num_images": {
          "type": "integer",
          "default": 1
        },
        "sync_mode": {
          "type": "boolean",
          "default": false
        },
        "guidance_scale": {
          "type": "number",
          "default": 4.5
        },
        "seed": {
          "type": "integer"
        },
        "image_size": {
          "type": "object"
        },
        "enable_safety_checker": {
          "type": "boolean",
          "default": true
        },
        "acceleration": {
          "type": "string",
          "enum": [
            "none",
            "regular"
          ],
          "default": "regular"
        },
        "negative_prompt": {
          "type": "string",
          "default": ""
        }
      },
      "required": [
        "image_urls"
      ]
    },
    "fal-ai/fashn/tryon/v1.6": {
      "properties": {
        "model_image": {
          "type": "string"
        },
        "segmentation_free": {
          "type": "boolean",
          "default": true
        },
        "moderation_level": {
          "type": "string",
          "enum": [
            "none",
            "permissive",
            "conservative"
          ],
          "default": "permissive"
        },
        "category": {
          "type": "string",
          "enum": [
            "tops",
            "bottoms",
            "one-pieces",
            "auto"
          ],
          "default": "auto"
        },
        "sync_mode": {
          "type": "boolean",
          "default": false
        },
        "num_samples": {
          "type": "integer",
          "default": 1
        },
        "seed": {
          "type": "integer"
        },
        "mode": {
          "type": "string",
          "enum": [
            "performance",
            "balanced",
            "quality"
          ],
          "default": "balanced"
        },
        "output_format": {
          "type": "string",
          "enum": [
            "png",
            "jpeg"
          ],
          "default": "png"
        },
        "garment_photo_type": {
          "type": "string",
          "enum": [
            "auto",
            "model",
            "flat-lay"
          ],
          "default": "auto"
        },
        "garment_image": {
          "type": "string"
        },
        "enable_safety_checker": {
          "type": "boolean",
          "default": true
        }
      },
      "required": [
        "model_image",
        "garment_image"
      ]
    },
    "fal-ai/bria/background/remove": {
      "properties": {
        "prompt": {
          "type": "string"
        },
        "sync_mode": {
          "type": "boolean",
          "default": false
        },
        "image_url": {
          "type": "string"
        }
      },
      "required": [
        "image_url"
      ]
    },
    "fal-ai/seedvr/upscale/image": {
      "properties": {
        "seed": {
          "type": "integer"
        },
        "upscale_mode": {
          "type": "string",
          "enum": [
            "target",
            "factor"
          ],
          "default": "factor"
        },
        "sync_mode": {
          "type": "boolean",
          "default": false
        },
        "noise_scale": {
          "type": "number",
          "default": 0.1
        },
        "output_format": {
          "type": "string",
          "enum": [
            "png",
            "jpg",
            "webp"
          ],
          "default": "jpg"
        },
        "target_resolution": {
          "type": "string",
          "enum": [
            "720p",
            "1080p",
            "1440p",
            "2160p"
          ],
          "default": "1080p"
        },
        "upscale_factor": {
          "type": "number",
          "default": 2
        },
        "image_url": {
          "type": "string"
        }
      },
      "required": [
        "image_url"
      ]
    },
    "fal-ai/bytedance/seedance/v1.5/pro/image-to-video": {
      "properties": {
        "resolution": {
          "type": "string",
          "enum": [
            "480p",
            "720p",
            "1080p"
          ],
          "default": "720p"
        },
        "duration": {
          "type": "string",
          "enum": [
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
            "11",
            "12"
          ],
          "default": "5"
        },
        "image_url": {
          "type": "string"
        },
        "prompt": {
          "type": "string"
        },
        "aspect_ratio": {
          "type": "string",
          "enum": [
            "21:9",
            "16:9",
            "4:3",
            "1:1",
            "3:4",
            "9:16",
            "auto"
          ],
          "default": "16:9"
        },
        "end_image_url": {
          "type": "string"
        },
        "camera_fixed": {
          "type": "boolean",
          "default": false
        },
        "generate_audio": {
          "type": "boolean",
          "default": true
        },
        "seed": {
          "type": "integer"
        },
        "enable_safety_checker": {
          "type": "boolean",
          "default": true
        }
      },
      "required": [
        "prompt",
        "image_url"
      ]
    }
  },
  "comfy": {
    "ugc_presenter_demo": ["action", "duration", "frames", "height", "image", "prompt", "seed", "start", "voice", "width"],
    "ugc_presenter_talk": ["image", "prompt", "seed", "voice"],
    "bernini_clone_edit": [
      "duration",
      "image",
      "image2",
      "image3",
      "prompt",
      "seed",
      "start",
      "video"
    ],
    "bernini_grade": [
      "duration",
      "prompt",
      "seed",
      "start",
      "video"
    ],
    "bernini_headswap": [
      "duration",
      "image",
      "prompt",
      "seed",
      "start",
      "video"
    ],
    "bernini_mixed": [
      "duration",
      "prompt",
      "seed",
      "start",
      "strength",
      "stride",
      "video"
    ],
    "bernini_recreate_ad": [
      "duration",
      "image",
      "image2",
      "prompt",
      "seed",
      "start",
      "video"
    ],
    "bernini_relight": [
      "duration",
      "prompt",
      "seed",
      "start",
      "video"
    ],
    "bernini_restyle": [
      "duration",
      "prompt",
      "seed",
      "start",
      "video"
    ],
    "bernini_swap": [
      "duration",
      "image",
      "prompt",
      "seed",
      "start",
      "video"
    ],
    "bernini_swap_noref": [
      "duration",
      "prompt",
      "seed",
      "start",
      "video"
    ],
    "birefnet_image": [
      "image",
      "output"
    ],
    "birefnet_qwen_background": [
      "image",
      "prompt",
      "seed"
    ],
    "birefnet_qwen_background_cloud": [
      "image",
      "prompt",
      "seed"
    ],
    "birefnet_video_matte": [
      "duration",
      "start",
      "video"
    ],
    "birefnet_video_matte_alpha": [
      "duration",
      "start",
      "video"
    ],
    "birefnet_video_matte_scene": [
      "background",
      "duration",
      "seed",
      "start",
      "video"
    ],
    "birefnet_video_matte_scene_cloud": [
      "background",
      "duration",
      "seed",
      "start",
      "video"
    ],
    "chatterbox_clone": [
      "audio",
      "prompt",
      "seed"
    ],
    "chatterbox_tts": [
      "cfg_weight",
      "exaggeration",
      "language",
      "prompt",
      "seed",
      "voice"
    ],
    "chatterbox_vc": [
      "audio",
      "seed",
      "voice"
    ],
    "cinema_shot": [
      "duration",
      "height",
      "image",
      "prompt",
      "seed",
      "width"
    ],
    "drama3_tts": [
      "prompt",
      "seed",
      "voice"
    ],
    "flux3_klein_t2i": [
      "count",
      "height",
      "prompt",
      "seed",
      "width"
    ],
    "flux3_klein_t2i_cloud": [
      "count",
      "height",
      "prompt",
      "seed",
      "width"
    ],
    "flux_character_set": [
      "count",
      "height",
      "image",
      "prompt",
      "seed",
      "width"
    ],
    "flux_character_set_cloud": [
      "count",
      "height",
      "image",
      "prompt",
      "seed",
      "width"
    ],
    "flux_look": [
      "count",
      "height",
      "prompt",
      "seed",
      "width"
    ],
    "flux_look_cloud": [
      "count",
      "height",
      "prompt",
      "seed",
      "width"
    ],
    "flux_look_ref": [
      "count",
      "height",
      "image",
      "prompt",
      "seed",
      "width"
    ],
    "flux_look_ref_cloud": [
      "count",
      "height",
      "image",
      "prompt",
      "seed",
      "width"
    ],
    "flux_trellis2": [
      "prompt",
      "seed"
    ],
    "flux_trellis2_cloud": [
      "prompt",
      "seed"
    ],
    "h3_draw": [
      "duration",
      "image",
      "mask",
      "prompt",
      "seed"
    ],
    "h3_extend": [
      "duration",
      "prompt",
      "seconds",
      "seed",
      "start",
      "video"
    ],
    "h3_flf2v": [
      "duration",
      "image",
      "image2",
      "prompt",
      "seed"
    ],
    "h3_freevideo_flf2v": [
      "duration",
      "image",
      "image2",
      "prompt",
      "seed"
    ],
    "h3_freevideo_i2v": [
      "duration",
      "height",
      "image",
      "prompt",
      "seed",
      "width"
    ],
    "h3_freevideo_t2v": [
      "duration",
      "height",
      "prompt",
      "seed",
      "width"
    ],
    "h3_i2v_audio": [
      "duration",
      "image",
      "prompt",
      "seed"
    ],
    "h3_loop": [
      "duration",
      "height",
      "prompt",
      "seed",
      "width"
    ],
    "h3_loop_cloud": [
      "duration",
      "height",
      "prompt",
      "seed",
      "width"
    ],
    "h3_lora_i2v": [
      "frames",
      "image",
      "image2",
      "lora",
      "lora_strength",
      "prompt",
      "seed"
    ],
    "h3_open_i2v": [
      "frames",
      "height",
      "image",
      "prompt",
      "seed",
      "width"
    ],
    "h3_open_t2v": [
      "frames",
      "height",
      "prompt",
      "seed",
      "width"
    ],
    "h3_product_ad": [
      "duration",
      "height",
      "image",
      "prompt",
      "seed",
      "width"
    ],
    "h3_ref2v": [
      "duration",
      "height",
      "image",
      "prompt",
      "seed",
      "width"
    ],
    "h3_studio_ad": [
      "duration",
      "height",
      "image",
      "image2",
      "image3",
      "prompt",
      "seed",
      "width"
    ],
    "h3_t2v": [
      "duration",
      "height",
      "image",
      "prompt",
      "seed",
      "width"
    ],
    "h3_truck_ad": [
      "duration",
      "height",
      "image",
      "prompt",
      "seed",
      "width"
    ],
    "h3_truck_ad_cloud": [
      "duration",
      "height",
      "image",
      "prompt",
      "seed",
      "width"
    ],
    "hidream": [
      "count",
      "height",
      "prompt",
      "seed",
      "width"
    ],
    "hunyuan_foley": [
      "duration",
      "prompt",
      "seed",
      "start",
      "video"
    ],
    "image_flux": [
      "count",
      "height",
      "prompt",
      "seed",
      "width"
    ],
    "image_grade": [
      "grain",
      "image",
      "preset",
      "temperature"
    ],
    "image_sdxl": [
      "count",
      "height",
      "prompt",
      "seed",
      "width"
    ],
    "image_upscale": [
      "image",
      "seed",
      "upscale_factor"
    ],
    "image_upscale_esrgan": [
      "image",
      "upscale_factor"
    ],
    "infinitetalk": [
      "audio",
      "image",
      "prompt",
      "seed"
    ],
    "infinitetalk_tts": [
      "cfg_weight",
      "exaggeration",
      "image",
      "language",
      "prompt",
      "script",
      "seed",
      "voice"
    ],
    "infinitetalk_v2v": [
      "audio",
      "duration",
      "prompt",
      "seed",
      "start",
      "video"
    ],
    "klein_character": [
      "count",
      "height",
      "image",
      "prompt",
      "seed",
      "width"
    ],
    "klein_character_cloud": [
      "count",
      "height",
      "image",
      "prompt",
      "seed",
      "width"
    ],
    "klein_character_swap": [
      "image",
      "image2",
      "prompt",
      "seed"
    ],
    "klein_character_swap_cloud": [
      "image",
      "image2",
      "prompt",
      "seed"
    ],
    "klein_edit": [
      "image",
      "prompt",
      "seed"
    ],
    "klein_edit_canvas": [
      "count",
      "height",
      "image",
      "prompt",
      "seed",
      "width"
    ],
    "klein_edit_canvas_cloud": [
      "count",
      "height",
      "image",
      "prompt",
      "seed",
      "width"
    ],
    "klein_edit_cloud": [
      "image",
      "prompt",
      "seed"
    ],
    "klein_h3": [
      "frames",
      "image",
      "motion",
      "prompt",
      "seed"
    ],
    "klein_h3_cloud": [
      "frames",
      "image",
      "motion",
      "prompt",
      "seed"
    ],
    "klein_headshot": [
      "count",
      "height",
      "image",
      "prompt",
      "seed",
      "width"
    ],
    "klein_headshot_cloud": [
      "count",
      "height",
      "image",
      "prompt",
      "seed",
      "width"
    ],
    "klein_ltx": [
      "frames",
      "image",
      "motion",
      "prompt",
      "seed"
    ],
    "klein_ltx_cloud": [
      "frames",
      "image",
      "motion",
      "prompt",
      "seed"
    ],
    "klein_moodboard": [
      "count",
      "height",
      "image",
      "image2",
      "image3",
      "prompt",
      "seed",
      "width"
    ],
    "klein_moodboard_cloud": [
      "count",
      "height",
      "image",
      "image2",
      "image3",
      "prompt",
      "seed",
      "width"
    ],
    "klein_retouch": [
      "image",
      "prompt",
      "seed"
    ],
    "klein_retouch_cloud": [
      "image",
      "prompt",
      "seed"
    ],
    "krea2_t2i": [
      "count",
      "height",
      "prompt",
      "seed",
      "width"
    ],
    "ltx25_i2v": [
      "frames",
      "height",
      "image",
      "prompt",
      "seed",
      "width"
    ],
    "ltx25_multishot": [
      "frames",
      "height",
      "image",
      "prompt",
      "seed",
      "width"
    ],
    "ltx25_t2v": [
      "frames",
      "height",
      "prompt",
      "seed",
      "width"
    ],
    "ltx_i2v": [
      "frames",
      "height",
      "image",
      "prompt",
      "seed",
      "width"
    ],
    "minimax_music3": [
      "duration",
      "lyrics",
      "prompt",
      "seed"
    ],
    "qwen2511_ad": [
      "height",
      "image",
      "image2",
      "image3",
      "prompt",
      "seed",
      "width"
    ],
    "qwen2511_edit": [
      "image",
      "image2",
      "image3",
      "prompt",
      "seed"
    ],
    "qwen2511_photodump": [
      "height",
      "image",
      "image2",
      "image3",
      "prompt",
      "seed",
      "width"
    ],
    "qwen2511_reframe": [
      "height",
      "image",
      "prompt",
      "seed",
      "width"
    ],
    "qwen2511_relight": [
      "image",
      "prompt",
      "seed"
    ],
    "qwen3_tts": [
      "prompt",
      "seed",
      "voice"
    ],
    "qwen_character_sheet": [
      "count",
      "height",
      "image",
      "prompt",
      "seed",
      "width"
    ],
    "qwen_character_sheet_cloud": [
      "count",
      "height",
      "image",
      "prompt",
      "seed",
      "width"
    ],
    "qwen_edit": [
      "count",
      "image",
      "prompt",
      "seed"
    ],
    "qwen_edit_cloud": [
      "count",
      "image",
      "prompt",
      "seed"
    ],
    "qwen_edit_mockup": [
      "count",
      "height",
      "image",
      "prompt",
      "seed",
      "width"
    ],
    "qwen_edit_mockup_cloud": [
      "count",
      "height",
      "image",
      "prompt",
      "seed",
      "width"
    ],
    "qwen_edit_outpaint": [
      "count",
      "image",
      "pad",
      "prompt",
      "seed"
    ],
    "qwen_edit_outpaint_cloud": [
      "count",
      "image",
      "pad",
      "prompt",
      "seed"
    ],
    "qwen_edit_place_product": [
      "count",
      "image",
      "image2",
      "prompt",
      "seed"
    ],
    "qwen_edit_place_product_cloud": [
      "count",
      "image",
      "image2",
      "prompt",
      "seed"
    ],
    "qwen_edit_style_ref": [
      "count",
      "image",
      "image2",
      "prompt",
      "seed"
    ],
    "qwen_edit_style_ref_cloud": [
      "count",
      "image",
      "image2",
      "prompt",
      "seed"
    ],
    "qwen_edit_try_on": [
      "count",
      "image",
      "image2",
      "image3",
      "prompt",
      "seed"
    ],
    "qwen_edit_try_on_cloud": [
      "count",
      "image",
      "image2",
      "image3",
      "prompt",
      "seed"
    ],
    "qwen_edit_variants": [
      "count",
      "image",
      "prompt",
      "seed"
    ],
    "qwen_edit_variants_cloud": [
      "count",
      "image",
      "prompt",
      "seed"
    ],
    "qwen_h3": [
      "frames",
      "height",
      "image",
      "motion",
      "prompt",
      "seed",
      "width"
    ],
    "qwen_h3_cloud": [
      "frames",
      "height",
      "image",
      "motion",
      "prompt",
      "seed",
      "width"
    ],
    "qwen_image21_t2i": [
      "count",
      "height",
      "prompt",
      "seed",
      "width"
    ],
    "qwen_image21_t2i_cloud": [
      "count",
      "height",
      "prompt",
      "seed",
      "width"
    ],
    "qwen_image_layered": [
      "image",
      "layers",
      "seed"
    ],
    "qwen_image_logo": [
      "count",
      "height",
      "prompt",
      "seed",
      "width"
    ],
    "qwen_image_logo_cloud": [
      "count",
      "height",
      "prompt",
      "seed",
      "width"
    ],
    "qwen_image_ref": [
      "count",
      "height",
      "image",
      "prompt",
      "seed",
      "width"
    ],
    "qwen_image_ref_cloud": [
      "count",
      "height",
      "image",
      "prompt",
      "seed",
      "width"
    ],
    "qwen_ltx": [
      "frames",
      "image",
      "motion",
      "prompt",
      "seed"
    ],
    "qwen_ltx_cloud": [
      "frames",
      "image",
      "motion",
      "prompt",
      "seed"
    ],
    "qwen_mockup_ltx": [
      "frames",
      "image",
      "motion",
      "prompt",
      "seed"
    ],
    "qwen_mockup_ltx_cloud": [
      "frames",
      "image",
      "motion",
      "prompt",
      "seed"
    ],
    "qwen_multi_h3": [
      "frames",
      "image",
      "image2",
      "image3",
      "image4",
      "image5",
      "motion",
      "prompt",
      "seed"
    ],
    "qwen_multi_h3_cloud": [
      "frames",
      "image",
      "image2",
      "image3",
      "image4",
      "image5",
      "motion",
      "prompt",
      "seed"
    ],
    "qwen_multiangle": [
      "azimuth",
      "batch",
      "elevation",
      "image",
      "seed",
      "zoom"
    ],
    "qwen_restore": [
      "image",
      "prompt",
      "seed"
    ],
    "qwen_restore_cloud": [
      "image",
      "prompt",
      "seed"
    ],
    "qwen_shots_grid": [
      "image",
      "seed"
    ],
    "qwen_try_on_h3": [
      "frames",
      "height",
      "image",
      "image2",
      "image3",
      "image4",
      "motion",
      "prompt",
      "seed",
      "width"
    ],
    "qwen_try_on_h3_cloud": [
      "frames",
      "height",
      "image",
      "image2",
      "image3",
      "image4",
      "motion",
      "prompt",
      "seed",
      "width"
    ],
    "qwen_zoom_grid": [
      "count",
      "image",
      "prompt",
      "seed"
    ],
    "qwen_zoom_grid_cloud": [
      "count",
      "image",
      "prompt",
      "seed"
    ],
    "recammaster": [
      "duration",
      "orbit",
      "prompt",
      "seed",
      "start",
      "trajectory",
      "video"
    ],
    "rife_interpolate": [
      "duration",
      "multiplier",
      "start",
      "video"
    ],
    "scail2_character_swap": [
      "duration",
      "image",
      "prompt",
      "seed",
      "start",
      "video"
    ],
    "seedvr2_image": [
      "image",
      "seed",
      "target",
      "upscale_factor"
    ],
    "seedvr2_video": [
      "duration",
      "seed",
      "start",
      "upscale_factor",
      "video"
    ],
    "seedvr2_video_7b": [
      "duration",
      "seed",
      "start",
      "upscale_factor",
      "video"
    ],
    "stable_audio3": [
      "duration",
      "prompt",
      "seed"
    ],
    "storyboard": [
      "count",
      "height",
      "prompt",
      "seed",
      "width"
    ],
    "storyboard_cloud": [
      "count",
      "height",
      "prompt",
      "seed",
      "width"
    ],
    "storyboard_ref": [
      "count",
      "height",
      "image",
      "prompt",
      "seed",
      "width"
    ],
    "storyboard_ref_cloud": [
      "count",
      "height",
      "image",
      "prompt",
      "seed",
      "width"
    ],
    "trellis2_character": [
      "image",
      "prompt",
      "seed"
    ],
    "trellis2_character_cloud": [
      "image",
      "prompt",
      "seed"
    ],
    "trellis2_image": [
      "image",
      "resolution",
      "seed"
    ],
    "trellis2_turntable": [
      "background",
      "image",
      "seed"
    ],
    "video_bg_change": [
      "duration",
      "prompt",
      "seed",
      "start",
      "video"
    ],
    "video_ltx": [
      "frames",
      "height",
      "prompt",
      "seed",
      "width"
    ],
    "void_inpaint": [
      "duration",
      "prompt",
      "seed",
      "start",
      "target",
      "video"
    ],
    "wan22_i2v": [
      "duration",
      "height",
      "image",
      "image2",
      "prompt",
      "seed",
      "width"
    ],
    "wan22_lora_i2v": [
      "duration",
      "image",
      "lora",
      "lora_low",
      "lora_low_strength",
      "lora_strength",
      "prompt",
      "seed"
    ],
    "wan22_t2v": [
      "duration",
      "height",
      "prompt",
      "seed",
      "width"
    ],
    "wan_animate2": [
      "image",
      "motion_frames",
      "motion_start",
      "prompt",
      "seed",
      "video"
    ],
    "z_image": [
      "count",
      "height",
      "prompt",
      "seed",
      "width"
    ]
  },
  "comfyOptional": {
    "ugc_presenter_demo": ["voice"],
    "ugc_presenter_talk": ["voice"],
    "bernini_clone_edit": [
      "image2",
      "image3"
    ],
    "bernini_recreate_ad": [
      "image2"
    ],
    "chatterbox_tts": [
      "voice"
    ],
    "drama3_tts": [
      "voice"
    ],
    "h3_lora_i2v": [
      "image2"
    ],
    "h3_studio_ad": [
      "image2",
      "image3"
    ],
    "infinitetalk_tts": [
      "voice"
    ],
    "klein_moodboard": [
      "image2",
      "image3"
    ],
    "klein_moodboard_cloud": [
      "image2",
      "image3"
    ],
    "ltx25_multishot": [
      "image"
    ],
    "qwen2511_ad": [
      "image2",
      "image3"
    ],
    "qwen2511_edit": [
      "image2",
      "image3"
    ],
    "qwen2511_photodump": [
      "image2",
      "image3"
    ],
    "qwen_edit_try_on": [
      "image3"
    ],
    "qwen_edit_try_on_cloud": [
      "image3"
    ],
    "qwen_h3": [
      "image"
    ],
    "qwen_h3_cloud": [
      "image"
    ],
    "qwen_multi_h3": [
      "image2",
      "image3",
      "image4",
      "image5"
    ],
    "qwen_multi_h3_cloud": [
      "image2",
      "image3",
      "image4",
      "image5"
    ],
    "qwen_try_on_h3": [
      "image2",
      "image3",
      "image4"
    ],
    "qwen_try_on_h3_cloud": [
      "image2",
      "image3",
      "image4"
    ],
    "wan22_i2v": [
      "image2"
    ]
  },
  "router": {
    "bfl/flux-2-pro": {
      "properties": {
        "height": {
          "maximum": 2048,
          "minimum": 256,
          "type": "integer"
        },
        "input_image": {
          "type": "string"
        },
        "input_image_2": {
          "type": "string"
        },
        "input_image_3": {
          "type": "string"
        },
        "input_image_4": {
          "type": "string"
        },
        "input_image_5": {
          "type": "string"
        },
        "input_image_6": {
          "type": "string"
        },
        "input_image_7": {
          "type": "string"
        },
        "input_image_8": {
          "type": "string"
        },
        "input_image_9": {
          "type": "string"
        },
        "output_format": {
          "enum": [
            "jpeg",
            "png"
          ],
          "type": "string"
        },
        "prompt": {
          "type": "string"
        },
        "prompt_upsampling": {
          "type": "boolean"
        },
        "safety_tolerance": {
          "maximum": 5,
          "minimum": 0,
          "type": "integer"
        },
        "seed": {
          "type": "integer"
        },
        "width": {
          "maximum": 2048,
          "minimum": 256,
          "type": "integer"
        }
      },
      "required": [
        "prompt"
      ],
      "type": "object"
    },
    "bfl/flux-2-max": {
      "properties": {
        "height": {
          "maximum": 2048,
          "minimum": 256,
          "type": "integer"
        },
        "input_image": {
          "type": "string"
        },
        "input_image_2": {
          "type": "string"
        },
        "input_image_3": {
          "type": "string"
        },
        "input_image_4": {
          "type": "string"
        },
        "input_image_5": {
          "type": "string"
        },
        "input_image_6": {
          "type": "string"
        },
        "input_image_7": {
          "type": "string"
        },
        "input_image_8": {
          "type": "string"
        },
        "input_image_9": {
          "type": "string"
        },
        "output_format": {
          "enum": [
            "jpeg",
            "png"
          ],
          "type": "string"
        },
        "prompt": {
          "type": "string"
        },
        "prompt_upsampling": {
          "type": "boolean"
        },
        "safety_tolerance": {
          "maximum": 5,
          "minimum": 0,
          "type": "integer"
        },
        "seed": {
          "type": "integer"
        },
        "width": {
          "maximum": 2048,
          "minimum": 256,
          "type": "integer"
        }
      },
      "required": [
        "prompt"
      ],
      "type": "object"
    },
    "bfl/flux-kontext-pro": {
      "properties": {
        "aspect_ratio": {
          "type": "string"
        },
        "input_image": {
          "type": "string"
        },
        "input_image_2": {
          "type": "string"
        },
        "input_image_3": {
          "type": "string"
        },
        "input_image_4": {
          "type": "string"
        },
        "output_format": {
          "enum": [
            "jpeg",
            "png",
            "webp"
          ],
          "type": "string"
        },
        "prompt": {
          "type": "string"
        },
        "prompt_upsampling": {
          "type": "boolean"
        },
        "safety_tolerance": {
          "maximum": 6,
          "minimum": 0,
          "type": "integer"
        },
        "seed": {
          "type": "integer"
        },
        "webhook_secret": {
          "type": "string"
        },
        "webhook_url": {
          "maxLength": 2083,
          "minLength": 1,
          "type": "string"
        }
      },
      "required": [
        "prompt"
      ],
      "type": "object"
    },
    "luma/photon-flash-1": {
      "properties": {
        "aspect_ratio": {
          "enum": [
            "1:1",
            "16:9",
            "9:16",
            "4:3",
            "3:4",
            "21:9",
            "9:21"
          ],
          "type": "string"
        },
        "callback_url": {
          "type": "string"
        },
        "character_ref": {
          "properties": {
            "identity0": {
              "properties": {
                "images": {
                  "items": {
                    "type": "string"
                  },
                  "type": "array"
                }
              },
              "type": "object"
            }
          },
          "type": "object"
        },
        "generation_type": {
          "enum": [
            "image"
          ],
          "type": "string"
        },
        "image_ref": {
          "items": {
            "properties": {
              "url": {
                "type": "string"
              },
              "weight": {
                "type": "number"
              }
            },
            "type": "object"
          },
          "type": "array"
        },
        "model": {
          "nullable": true,
          "type": "string"
        },
        "modify_image_ref": {
          "properties": {
            "url": {
              "type": "string"
            },
            "weight": {
              "type": "number"
            }
          },
          "type": "object"
        },
        "prompt": {
          "type": "string"
        },
        "style_ref": {
          "items": {
            "properties": {
              "url": {
                "type": "string"
              },
              "weight": {
                "type": "number"
              }
            },
            "type": "object"
          },
          "type": "array"
        }
      },
      "type": "object"
    },
    "byteplus/seedream-5-0-flash-260915": {
      "properties": {
        "guidance_scale": {
          "maximum": 10,
          "minimum": 1,
          "type": "number"
        },
        "image": {
          "oneOf": [
            {
              "type": "string"
            },
            {
              "items": {
                "type": "string"
              },
              "maxItems": 10,
              "minItems": 1,
              "type": "array"
            }
          ]
        },
        "layer_decomposition": {
          "type": "boolean"
        },
        "model": {
          "nullable": true,
          "type": "string"
        },
        "optimize_prompt_options": {
          "properties": {
            "mode": {
              "enum": [
                "standard",
                "fast"
              ],
              "type": "string"
            }
          },
          "type": "object"
        },
        "output_format": {
          "enum": [
            "png",
            "jpeg"
          ],
          "type": "string"
        },
        "prompt": {
          "type": "string"
        },
        "response_format": {
          "enum": [
            "url",
            "b64_json"
          ],
          "type": "string"
        },
        "seed": {
          "maximum": 2147483647,
          "minimum": -1,
          "type": "integer"
        },
        "sequential_image_generation": {
          "enum": [
            "auto",
            "disabled"
          ],
          "type": "string"
        },
        "sequential_image_generation_options": {
          "properties": {
            "max_images": {
              "maximum": 15,
              "minimum": 1,
              "type": "integer"
            }
          },
          "type": "object"
        },
        "size": {
          "type": "string"
        },
        "stream": {
          "type": "boolean"
        },
        "watermark": {
          "type": "boolean"
        }
      },
      "required": [],
      "anyOf": [
        {
          "required": [
            "prompt"
          ]
        },
        {
          "required": [
            "image"
          ]
        }
      ],
      "type": "object"
    },
    "byteplus/dreamina-seedance-2-5-260628": {
      "properties": {
        "callback_url": {
          "type": "string"
        },
        "content": {
          "items": {
            "oneOf": [
              {
                "properties": {
                  "type": {
                    "enum": [
                      "text"
                    ]
                  }
                },
                "required": [
                  "text"
                ]
              },
              {
                "properties": {
                  "type": {
                    "enum": [
                      "image_url"
                    ]
                  }
                },
                "required": [
                  "image_url"
                ]
              },
              {
                "properties": {
                  "type": {
                    "enum": [
                      "video_url"
                    ]
                  }
                },
                "required": [
                  "video_url"
                ]
              },
              {
                "properties": {
                  "type": {
                    "enum": [
                      "audio_url"
                    ]
                  }
                },
                "required": [
                  "audio_url"
                ]
              },
              {
                "properties": {
                  "type": {
                    "enum": [
                      "draft_task"
                    ]
                  }
                },
                "required": [
                  "draft_task"
                ]
              }
            ],
            "properties": {
              "audio_url": {
                "properties": {
                  "url": {
                    "type": "string"
                  }
                },
                "required": [
                  "url"
                ],
                "type": "object"
              },
              "draft_task": {
                "properties": {
                  "id": {
                    "type": "string"
                  }
                },
                "required": [
                  "id"
                ],
                "type": "object"
              },
              "image_url": {
                "properties": {
                  "url": {
                    "type": "string"
                  }
                },
                "required": [
                  "url"
                ],
                "type": "object"
              },
              "role": {
                "enum": [
                  "first_frame",
                  "last_frame",
                  "reference_image",
                  "reference_video",
                  "reference_audio"
                ],
                "type": "string"
              },
              "text": {
                "maxLength": 100000,
                "type": "string"
              },
              "type": {
                "enum": [
                  "text",
                  "image_url",
                  "video_url",
                  "audio_url",
                  "draft_task"
                ],
                "type": "string"
              },
              "video_url": {
                "properties": {
                  "url": {
                    "type": "string"
                  }
                },
                "required": [
                  "url"
                ],
                "type": "object"
              }
            },
            "required": [
              "type"
            ],
            "type": "object"
          },
          "minItems": 1,
          "type": "array"
        },
        "draft": {
          "type": "boolean"
        },
        "duration": {
          "anyOf": [
            {
              "enum": [
                -1
              ]
            },
            {
              "maximum": 30,
              "minimum": 2
            }
          ],
          "type": "integer"
        },
        "execution_expires_after": {
          "maximum": 259200,
          "minimum": 3600,
          "type": "integer"
        },
        "generate_audio": {
          "type": "boolean"
        },
        "model": {
          "nullable": true,
          "type": "string"
        },
        "output_format": {
          "enum": [
            "mp4",
            "mov"
          ],
          "type": "string"
        },
        "ratio": {
          "enum": [
            "16:9",
            "4:3",
            "1:1",
            "3:4",
            "9:16",
            "21:9",
            "9:21",
            "adaptive"
          ],
          "type": "string"
        },
        "resolution": {
          "enum": [
            "480p",
            "720p",
            "1080p",
            "4k"
          ],
          "type": "string"
        },
        "return_last_frame": {
          "type": "boolean"
        },
        "seed": {
          "maximum": 4294967295,
          "minimum": -1,
          "type": "integer"
        },
        "service_tier": {
          "enum": [
            "default",
            "flex"
          ],
          "type": "string"
        },
        "watermark": {
          "type": "boolean"
        }
      },
      "required": [
        "content"
      ],
      "type": "object"
    },
    "byteplus/seedance-1-0-pro-fast-251015": {
      "properties": {
        "callback_url": {
          "type": "string"
        },
        "content": {
          "items": {
            "oneOf": [
              {
                "properties": {
                  "type": {
                    "enum": [
                      "text"
                    ]
                  }
                },
                "required": [
                  "text"
                ]
              },
              {
                "properties": {
                  "type": {
                    "enum": [
                      "image_url"
                    ]
                  }
                },
                "required": [
                  "image_url"
                ]
              },
              {
                "properties": {
                  "type": {
                    "enum": [
                      "video_url"
                    ]
                  }
                },
                "required": [
                  "video_url"
                ]
              },
              {
                "properties": {
                  "type": {
                    "enum": [
                      "audio_url"
                    ]
                  }
                },
                "required": [
                  "audio_url"
                ]
              },
              {
                "properties": {
                  "type": {
                    "enum": [
                      "draft_task"
                    ]
                  }
                },
                "required": [
                  "draft_task"
                ]
              }
            ],
            "properties": {
              "audio_url": {
                "properties": {
                  "url": {
                    "type": "string"
                  }
                },
                "required": [
                  "url"
                ],
                "type": "object"
              },
              "draft_task": {
                "properties": {
                  "id": {
                    "type": "string"
                  }
                },
                "required": [
                  "id"
                ],
                "type": "object"
              },
              "image_url": {
                "properties": {
                  "url": {
                    "type": "string"
                  }
                },
                "required": [
                  "url"
                ],
                "type": "object"
              },
              "role": {
                "enum": [
                  "first_frame",
                  "last_frame",
                  "reference_image",
                  "reference_video",
                  "reference_audio"
                ],
                "type": "string"
              },
              "text": {
                "maxLength": 100000,
                "type": "string"
              },
              "type": {
                "enum": [
                  "text",
                  "image_url",
                  "video_url",
                  "audio_url",
                  "draft_task"
                ],
                "type": "string"
              },
              "video_url": {
                "properties": {
                  "url": {
                    "type": "string"
                  }
                },
                "required": [
                  "url"
                ],
                "type": "object"
              }
            },
            "required": [
              "type"
            ],
            "type": "object"
          },
          "minItems": 1,
          "type": "array"
        },
        "draft": {
          "type": "boolean"
        },
        "duration": {
          "anyOf": [
            {
              "enum": [
                -1
              ]
            },
            {
              "maximum": 30,
              "minimum": 2
            }
          ],
          "type": "integer"
        },
        "execution_expires_after": {
          "maximum": 259200,
          "minimum": 3600,
          "type": "integer"
        },
        "generate_audio": {
          "type": "boolean"
        },
        "model": {
          "nullable": true,
          "type": "string"
        },
        "output_format": {
          "enum": [
            "mp4",
            "mov"
          ],
          "type": "string"
        },
        "ratio": {
          "enum": [
            "16:9",
            "4:3",
            "1:1",
            "3:4",
            "9:16",
            "21:9",
            "9:21",
            "adaptive"
          ],
          "type": "string"
        },
        "resolution": {
          "enum": [
            "480p",
            "720p",
            "1080p",
            "4k"
          ],
          "type": "string"
        },
        "return_last_frame": {
          "type": "boolean"
        },
        "seed": {
          "maximum": 4294967295,
          "minimum": -1,
          "type": "integer"
        },
        "service_tier": {
          "enum": [
            "default",
            "flex"
          ],
          "type": "string"
        },
        "watermark": {
          "type": "boolean"
        }
      },
      "required": [
        "content"
      ],
      "type": "object"
    },
    "ltx/ltx-2-5-fast": {
      "properties": {
        "duration": {
          "enum": [
            2,
            3,
            4,
            5,
            6,
            8,
            10,
            12,
            14,
            16,
            18,
            20
          ],
          "type": "integer"
        },
        "fps": {
          "enum": [
            24,
            25,
            48,
            50
          ],
          "type": "integer"
        },
        "generate_audio": {
          "type": "boolean"
        },
        "model": {
          "nullable": true,
          "type": "string"
        },
        "prompt": {
          "maxLength": 10000,
          "type": "string"
        },
        "resolution": {
          "enum": [
            "1280x720",
            "720x1280",
            "1920x1080",
            "1080x1920",
            "2560x1440",
            "1440x2560",
            "3840x2160",
            "2160x3840"
          ],
          "type": "string"
        }
      },
      "required": [
        "prompt",
        "duration",
        "resolution"
      ],
      "type": "object"
    },
    "elevenlabs/eleven_v4_turbo": {
      "properties": {
        "apply_text_normalization": {
          "enum": [
            "auto",
            "on",
            "off"
          ],
          "type": "string"
        },
        "inputs": {
          "items": {
            "properties": {
              "text": {
                "type": "string"
              },
              "voice_id": {
                "type": "string"
              }
            },
            "required": [
              "text",
              "voice_id"
            ],
            "type": "object"
          },
          "minItems": 1,
          "type": "array"
        },
        "language_code": {
          "nullable": true,
          "type": "string"
        },
        "model_id": {
          "nullable": true,
          "type": "string"
        },
        "pronunciation_dictionary_locators": {
          "items": {
            "properties": {
              "pronunciation_dictionary_id": {
                "type": "string"
              },
              "version_id": {
                "type": "string"
              }
            },
            "required": [
              "pronunciation_dictionary_id",
              "version_id"
            ],
            "type": "object"
          },
          "maxItems": 3,
          "nullable": true,
          "type": "array"
        },
        "seed": {
          "maximum": 4294967295,
          "minimum": 0,
          "nullable": true,
          "type": "integer"
        },
        "settings": {
          "nullable": true,
          "properties": {
            "stability": {
              "nullable": true,
              "type": "number"
            }
          },
          "type": "object"
        }
      },
      "required": [
        "inputs"
      ],
      "type": "object"
    },
    "elevenlabs/eleven_sfx_v2": {
      "properties": {
        "duration_seconds": {
          "maximum": 30,
          "minimum": 0.5,
          "nullable": true,
          "type": "number"
        },
        "loop": {
          "type": "boolean"
        },
        "model_id": {
          "nullable": true,
          "type": "string"
        },
        "prompt_influence": {
          "maximum": 1,
          "minimum": 0,
          "type": "number"
        },
        "text": {
          "type": "string"
        }
      },
      "required": [
        "text",
        "duration_seconds"
      ],
      "type": "object"
    },
    "openai/gpt-4.1-nano": {
      "properties": {
        "include": {
          "items": {
            "type": "string"
          },
          "nullable": true,
          "type": "array"
        },
        "input": {
          "oneOf": [
            {
              "type": "string"
            },
            {
              "items": {},
              "type": "array"
            }
          ]
        },
        "instructions": {
          "nullable": true,
          "type": "string"
        },
        "max_output_tokens": {
          "minimum": 1,
          "nullable": true,
          "type": "integer"
        },
        "model": {
          "nullable": true,
          "type": "string"
        },
        "parallel_tool_calls": {
          "nullable": true,
          "type": "boolean"
        },
        "previous_response_id": {
          "nullable": true,
          "type": "string"
        },
        "reasoning": {
          "nullable": true,
          "type": "object"
        },
        "store": {
          "nullable": true,
          "type": "boolean"
        },
        "stream": {
          "nullable": true,
          "type": "boolean"
        },
        "temperature": {
          "maximum": 2,
          "minimum": 0,
          "nullable": true,
          "type": "number"
        },
        "text": {
          "nullable": true,
          "type": "object"
        },
        "tool_choice": {
          "nullable": true,
          "oneOf": [
            {
              "type": "string"
            },
            {
              "type": "object"
            }
          ]
        },
        "tools": {
          "items": {},
          "nullable": true,
          "type": "array"
        },
        "top_p": {
          "maximum": 1,
          "minimum": 0,
          "nullable": true,
          "type": "number"
        },
        "truncation": {
          "enum": [
            "auto",
            "disabled"
          ],
          "nullable": true,
          "type": "string"
        },
        "usage": {
          "nullable": true,
          "type": "object"
        }
      },
      "required": [
        "input"
      ],
      "type": "object"
    }
  }
}
