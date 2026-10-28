# Postiz scheduling

Connect Postiz in Connections with your API key. Save and test only lists channels. The default API base is `https://api.postiz.com/public/v1`; for self-hosting enter your full public API base, including `/public/v1` (and `/api` if your reverse proxy requires it). Redirects are refused to protect your key.

From Assets, open Schedule on a finished image or video. Choose the channel, caption and local date/time. Schedule converts the time to an ISO timestamp; Save as draft creates an unpublished Postiz draft. Expand Channel settings for platform-specific settings. YouTube needs a title and visibility, Instagram needs a post type, and TikTok needs explicit privacy and posting controls. These are never guessed; use the linked Postiz settings reference. The API validates platform settings.

The Queue tab stores ideas per channel. Add an idea, set its status, and attach a Library `/media/...` URL when made. Scheduling from that item records the returned post ID and date. Status changes alone do not publish anything; a draft does not mark an item scheduled.

```sh
comfyfield connect postiz --key <key> --url https://api.postiz.com/public/v1
comfyfield channels
comfyfield schedule /media/finished.mp4 --channel <integration-id> --at 2026-10-30T17:00:00Z --caption 'Finished post' --request-key campaign-1 --settings '{"<integration-id>":{"title":"Launch","type":"public"}}'
comfyfield queue add --channel <integration-id> --idea 'Next tutorial'
comfyfield queue list --channel <integration-id>
comfyfield queue update <id> --status made --library-item /media/finished.mp4
comfyfield queue remove <id>
```

MCP exposes `postiz_channels`, `schedule_post`, and queue list/add/update/remove. `schedule_post` requires `requestKey`; reuse it for the same request. The CLI derives a stable key from its input when `--request-key` is omitted; use an explicit key to distinguish an intentional repeat. The app retains its key while the sheet is open. Never reopen and resubmit after an uncertain result without checking Postiz first.

Local files must resolve inside the data folder's `media` directory, including symlink checks. Public remote URLs use the guarded downloader. Only supported images and MP4 video are uploaded; this first version caps each file at 50 MB and does not transcode. Postiz inspects actual content and platforms impose further limits.

The data folder (normally `~/.comfyfield`, or `.comfyfield` under `COMFYFIELD_HOME`) holds `queue.json` and `postiz.json`. A request is reserved on disk before any upload or create request. Completed, in-flight and uncertain keys all refuse reuse, including after restart or across app/CLI/MCP processes. No automatic retry is made. After an error, inspect Postiz and the ledger; only use a new key when certain the original did not create a post. An interrupted storage transaction can leave a `.lock`; inspect it before manual removal. Keep the ledger when restoring backups.

## API contract

- [Overview and authentication](https://docs.postiz.com/public-api/introduction): raw API key in `Authorization`, no bearer prefix. The documented create-post limit is 90 requests/hour on self-hosted defaults and 100/hour on cloud; it applies to create calls, not channel listing or uploads. Self-hosted limits are configurable.
- [List integrations](https://docs.postiz.com/public-api/integrations/list): `GET /integrations`, returns channel IDs and provider identifiers.
- [Upload file](https://docs.postiz.com/public-api/uploads/upload-file): `POST /upload`, multipart `file` and `adjust=false`, returns `id` and `path`.
- [Create post](https://docs.postiz.com/public-api/posts/create): `POST /posts`, with `type: schedule|draft`, ISO `date`, `shortLink: false`, `tags: []`, and `posts: [{ integration: { id }, value: [{ content, image: [{ id, path }] }], settings: { __type, ...platformSettings } }]`. Response is an array of `{ postId, integration }`.

No documented idempotency contract is assumed. The local ledger supplies duplicate refusal. Verification uses mocked Postiz only; real account permissions, platform settings and eventual publication remain unverified.
