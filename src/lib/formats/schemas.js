// Public fal input schemas and bundled Comfy placeholders. Refresh with node scripts/format-schemas.mjs.
export const schemas = {
  "fal": {
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
    }
  },
  "comfy": {
    "image_flux": [
      "count",
      "height",
      "prompt",
      "seed",
      "width"
    ],
    "image_sdxl": [
      "count",
      "height",
      "prompt",
      "seed",
      "width"
    ],
    "video_ltx": [
      "frames",
      "height",
      "prompt",
      "seed",
      "width"
    ]
  }
}
