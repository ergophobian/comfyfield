## Presets: motion, effects and mixed media

On Higgsfield a preset is a saved recipe that a user picks instead of writing a prompt. The help center calls a motion preset a "motion blueprint": it fixes the camera move or the effect, and the user mainly supplies the picture. We captured three libraries in full. The Motion library has 229 preset pages, which hold 134 distinct presets. The Effects hub, which Higgsfield also calls Effects 2.0 and Viral Presets, lists 45 effects. Mixed Media has 33 preset pages. Around them sit smaller libraries for Genjutsu, Katana, Soul, Cinema Studio, Sora 2 and others.

Applying a motion preset takes four steps. Open Video, then Create Video, and pick a preset; the model selector then shows Higgsfield Standard, which is Higgsfield's own DoP image-to-video model. Upload one keyframe image (PNG or JPG, pasted, or generated on the spot). Optionally add a prompt, with an Enhance toggle that expands it. Then generate. Advanced settings offer a 3 or 5 second duration, a seed and a step count, and the Generate button shows the credit cost before you confirm. Mix combines presets in one generation, and 16 ready-made pairs ship as their own pages (for example Turning Metal + Melting). None of the captured pages or help articles shows a strength or intensity slider. The closest thing is the category split, where Basic and Epic camera control are described as moves of increasing intensity. Pricing lists three DoP tiers at 720p: Lite at about 3 credits, Turbo at about 5 and Standard at about 7, each per 3 second clip. The API charges $0.125 per DoP generation. Presets are also exposed through Higgsfield MCP, so Claude and other agents can browse and run them.

Viral Presets in the Effects hub need even less input: upload a photo, choose a resolution (480p up to 4K on most) and an aspect ratio where offered, and generate. The animation, location and style are built in, and there is no prompt. Mixed Media works on video instead: upload a clip of 1 to 10 seconds, pick a look, set the frame rate and resolution, and generate.

### Motion presets (229)

#### How the library works

- One library, many shop windows. Every preset has its own page at `/motion/<uuid>` with a name, a two-line description, a Generate button and sample clips. Themed hub pages slice the same library: Camera controls (`/camera-controls`, 65 entries, billed as "50+"), Viral (`/viral`, 54), Visual effects (`/collection/effects`, 100, plus a link to the Catch the Pulse collection), UGC (`/ugc`, 45) and Commercial (`/commercial`, 27).
- Categories in the generator are Effects (VFX transformations), Basic Camera Control and Epic Camera Control (camera moves of rising intensity), Catch the Pulse (a curated theme), Mix, and New and Trending feeds. A Top choice badge marks curated highlights (25 of the 229 pages).
- Duplicates. 93 names appear on two pages and Innerlight on three, each with its own uuid and identical text. The data does not say why; the likely reason is that the same preset sits in more than one collection or version. 9 pages also carry an unexplained "Buralqy" badge, possibly a creator credit.
- The captured set is not the whole library. The hub pages name 205 distinct presets, and 125 of them had no captured page (for example Pan Left, Aerial Pullback, Timelapse Glam, Giant Grab, Money Rain and a family of named transitions). In the other direction, 54 captured presets appear on no hub list, among them all the sports moves, most Mix pairs and many VFX. Counting both, the library holds at least 259 distinct names.
- Models. The preset pages do not name a model. The help center ties presets to DoP, and Higgsfield describes DoP as its own cinematography layer: VFX and directed camera moves applied through presets. Credits follow the DoP tier (see above), and the help center says DoP is billed at standard rates.
- Input is always one image. DoP has no text-only mode, and the help center suggests making the keyframe in Soul or Nano Banana Pro first.

#### All 229 presets

Categories are our own, assigned from each name and description. Mix pairs are filed under the part that dominates the result.

| Category | Preset | What it does | Route | Shot |
| --- | --- | --- | --- | --- |
| Camera move | 360 Orbit | Camera circles all the way around the subject. | `/motion/866a58b8-46e2-4a09-bcd8-1aaaa489730c` | {{shot:/motion/866a58b8-46e2-4a09-bcd8-1aaaa489730c}} |
| Camera move | 360 Orbit | Camera circles all the way around the subject. | `/motion/d7c180bc-793c-4d29-83ba-c2d5e84e53d4` | {{shot:/motion/d7c180bc-793c-4d29-83ba-c2d5e84e53d4}} |
| Camera move | 3D Rotation | Subject or product spins in place for a full turn. Top choice. | `/motion/6f06f47e-922e-4660-9fe9-754e4be69696` | {{shot:/motion/6f06f47e-922e-4660-9fe9-754e4be69696}} |
| Camera move | 3D Rotation | Subject or product spins in place for a full turn. Top choice. | `/motion/c2d8f36a-319f-40e4-b5d0-94d4ff9be304` | {{shot:/motion/c2d8f36a-319f-40e4-b5d0-94d4ff9be304}} |
| Camera move | Arc Left | Camera curves around the subject to the left. | `/motion/2a5d8f86-aef3-4b34-b5ee-fb2020daa131` | {{shot:/motion/2a5d8f86-aef3-4b34-b5ee-fb2020daa131}} |
| Camera move | Arc Left | Camera curves around the subject to the left. | `/motion/a5b35657-5a5f-47cb-8042-786381f47433` | {{shot:/motion/a5b35657-5a5f-47cb-8042-786381f47433}} |
| Camera move | Arc Right | Camera curves around the subject to the right. Top choice. | `/motion/0bdbf318-f918-4f9b-829a-74cab681d806` | {{shot:/motion/0bdbf318-f918-4f9b-829a-74cab681d806}} |
| Camera move | Arc Right | Camera curves around the subject to the right. Top choice. | `/motion/f0eca915-e819-4295-a3c5-a46ac6e63a2a` | {{shot:/motion/f0eca915-e819-4295-a3c5-a46ac6e63a2a}} |
| Camera move | Buckle Up | Low shot from beneath, as if through a glass floor. | `/motion/4ef72175-227a-418b-923d-2831dcdf7d4f` | {{shot:/motion/4ef72175-227a-418b-923d-2831dcdf7d4f}} |
| Camera move | Buckle Up | Low shot from beneath, as if through a glass floor. | `/motion/678f065d-cf5b-4d3d-8d49-9251c43e8653` | {{shot:/motion/678f065d-cf5b-4d3d-8d49-9251c43e8653}} |
| Camera move | Car Chasing | Follows speeding cars from dynamic chase angles. | `/motion/2f2a541b-6ce5-4115-92fb-4d6473d8e3ae` | {{shot:/motion/2f2a541b-6ce5-4115-92fb-4d6473d8e3ae}} |
| Camera move | Car Chasing | Follows speeding cars from dynamic chase angles. | `/motion/a76f2e99-0a41-4fdf-934d-9c95b0ee85bf` | {{shot:/motion/a76f2e99-0a41-4fdf-934d-9c95b0ee85bf}} |
| Camera move | Car Grip | Camera rigged to a car for smooth driving shots. | `/motion/b7334ffd-a260-42a5-8911-714bcc541b16` | {{shot:/motion/b7334ffd-a260-42a5-8911-714bcc541b16}} |
| Camera move | Car Grip | Camera rigged to a car for smooth driving shots. | `/motion/d4c62a9d-df77-4222-af4e-5645b81844e0` | {{shot:/motion/d4c62a9d-df77-4222-af4e-5645b81844e0}} |
| Camera move | Crane Down | Camera lowers from above down to the subject. | `/motion/41d4241f-8e3a-4c72-bd1d-89e93f06b0f0` | {{shot:/motion/41d4241f-8e3a-4c72-bd1d-89e93f06b0f0}} |
| Camera move | Crane Down | Camera lowers from above down to the subject. | `/motion/494db3c2-2297-4cf7-bef7-cba0cebe73ee` | {{shot:/motion/494db3c2-2297-4cf7-bef7-cba0cebe73ee}} |
| Camera move | Crane Over The Head | Camera rises up and over the subject. | `/motion/f77584f2-7442-4128-91b5-095829b108c7` | {{shot:/motion/f77584f2-7442-4128-91b5-095829b108c7}} |
| Camera move | Crane Over The Head + Crash Zoom In | Mix: overhead rise that ends in a sudden punch in. | `/motion/107cd0d5-62d4-476b-bf60-7461313bfa45` | {{shot:/motion/107cd0d5-62d4-476b-bf60-7461313bfa45}} |
| Camera move | Crane Over The Head + Crash Zoom In | Mix: overhead rise that ends in a sudden punch in. | `/motion/cc664502-7fdc-412e-8fd7-6af310c8891b` | {{shot:/motion/cc664502-7fdc-412e-8fd7-6af310c8891b}} |
| Camera move | Crane Up | Camera lifts on a crane to reveal the scene. | `/motion/2da63d27-94e0-48e0-8e2e-936274bd176e` | {{shot:/motion/2da63d27-94e0-48e0-8e2e-936274bd176e}} |
| Camera move | Crane Up | Camera lifts on a crane to reveal the scene. | `/motion/45d7f47f-2c7b-4c5e-84b7-943758a39dcc` | {{shot:/motion/45d7f47f-2c7b-4c5e-84b7-943758a39dcc}} |
| Camera move | Crash Zoom In | Fast, dramatic zoom into the subject. | `/motion/1cc27a2b-3b89-44d4-a7f9-d583454a8960` | {{shot:/motion/1cc27a2b-3b89-44d4-a7f9-d583454a8960}} |
| Camera move | Crash Zoom In | Fast, dramatic zoom into the subject. | `/motion/a2dddb76-03fa-429e-9905-577bffdf9d38` | {{shot:/motion/a2dddb76-03fa-429e-9905-577bffdf9d38}} |
| Camera move | Crash Zoom Out | Fast zoom out to reveal the whole scene. | `/motion/3972c090-a448-4fd4-b8f0-cb71b4b523ee` | {{shot:/motion/3972c090-a448-4fd4-b8f0-cb71b4b523ee}} |
| Camera move | Crash Zoom Out | Fast zoom out to reveal the whole scene. | `/motion/d5cf181f-b75b-4827-8614-f08953b92e62` | {{shot:/motion/d5cf181f-b75b-4827-8614-f08953b92e62}} |
| Camera move | Dolly In | Camera glides toward the subject. | `/motion/06463063-551a-4cbb-abc0-0ff1007784b3` | {{shot:/motion/06463063-551a-4cbb-abc0-0ff1007784b3}} |
| Camera move | Dolly In | Camera glides toward the subject. | `/motion/8d582076-10e2-40f7-bbef-6384532147c2` | {{shot:/motion/8d582076-10e2-40f7-bbef-6384532147c2}} |
| Camera move | Dolly Left | Camera slides sideways to the left. | `/motion/36186f21-e20f-479f-a7b9-f7f12354a4ab` | {{shot:/motion/36186f21-e20f-479f-a7b9-f7f12354a4ab}} |
| Camera move | Dolly Left | Camera slides sideways to the left. | `/motion/b03fa9e3-8e69-4fa2-bcc2-b18e362f9fba` | {{shot:/motion/b03fa9e3-8e69-4fa2-bcc2-b18e362f9fba}} |
| Camera move | Dolly Out | Camera pulls away to show more of the scene. | `/motion/96e95a3c-ad0e-49ee-84e3-a39e0f13b543` | {{shot:/motion/96e95a3c-ad0e-49ee-84e3-a39e0f13b543}} |
| Camera move | Dolly Out | Camera pulls away to show more of the scene. | `/motion/c1a8c847-4ea8-4d31-9cec-ef62897a2d17` | {{shot:/motion/c1a8c847-4ea8-4d31-9cec-ef62897a2d17}} |
| Camera move | Dolly Right | Camera slides sideways to the right. | `/motion/17a8f1d4-88a4-4bb5-a662-c28e8ea7d023` | {{shot:/motion/17a8f1d4-88a4-4bb5-a662-c28e8ea7d023}} |
| Camera move | Dolly Right | Camera slides sideways to the right. | `/motion/22f946c2-ed60-44bf-bca3-2be92c07d261` | {{shot:/motion/22f946c2-ed60-44bf-bca3-2be92c07d261}} |
| Camera move | Dolly Zoom In | Push in while zooming out, so the background warps. | `/motion/114245a3-93fb-434a-9299-44ca9e4656a3` | {{shot:/motion/114245a3-93fb-434a-9299-44ca9e4656a3}} |
| Camera move | Dolly Zoom In | Push in while zooming out, so the background warps. | `/motion/7d1c4551-e7cb-4728-b473-6b0b85f82b44` | {{shot:/motion/7d1c4551-e7cb-4728-b473-6b0b85f82b44}} |
| Camera move | Dolly Zoom Out | Pull back while zooming in for a vertigo warp. | `/motion/520a2d8d-f9b2-4d0a-9fdf-85d02a13c976` | {{shot:/motion/520a2d8d-f9b2-4d0a-9fdf-85d02a13c976}} |
| Camera move | Dolly Zoom Out | Pull back while zooming in for a vertigo warp. | `/motion/e057dbd5-1734-4462-bb4c-7d64fe20795e` | {{shot:/motion/e057dbd5-1734-4462-bb4c-7d64fe20795e}} |
| Camera move | Double Dolly | Camera and subject travel together while the background slides by. | `/motion/66ab5702-475d-4153-92a1-ff67cc3dec25` | {{shot:/motion/66ab5702-475d-4153-92a1-ff67cc3dec25}} |
| Camera move | Double Dolly | Camera and subject travel together while the background slides by. | `/motion/e522bff4-da3b-4f7d-8c6e-f925b60979c5` | {{shot:/motion/e522bff4-da3b-4f7d-8c6e-f925b60979c5}} |
| Camera move | Earth Zoom Out | Pulls back from the subject to the city, the continent, then Earth. Top choice. | `/motion/70e490b9-26b7-4572-8d9c-2ac8dcc9adc0` | {{shot:/motion/70e490b9-26b7-4572-8d9c-2ac8dcc9adc0}} |
| Camera move | Eyes In | Pushes in close on the subject's eyes. Top choice. | `/motion/0ab33462-481e-4c78-8ffc-086bebd84187` | {{shot:/motion/0ab33462-481e-4c78-8ffc-086bebd84187}} |
| Camera move | Eyes In | Pushes in close on the subject's eyes. Top choice. | `/motion/f226ac67-43d3-4726-ad9c-132608bda8b3` | {{shot:/motion/f226ac67-43d3-4726-ad9c-132608bda8b3}} |
| Camera move | Flying | Smooth, gliding drone-style flight through the scene. | `/motion/3b83bad3-64bd-4baa-bf73-be886f19a10c` | {{shot:/motion/3b83bad3-64bd-4baa-bf73-be886f19a10c}} |
| Camera move | Flying | Smooth, gliding drone-style flight through the scene. | `/motion/d5ec4a6e-d982-4245-92eb-971c74505c9a` | {{shot:/motion/d5ec4a6e-d982-4245-92eb-971c74505c9a}} |
| Camera move | FPV Drone | Fast first-person drone flight through tight spaces. | `/motion/244dc358-abee-426c-8966-b735978421b3` | {{shot:/motion/244dc358-abee-426c-8966-b735978421b3}} |
| Camera move | FPV Drone | Fast first-person drone flight through tight spaces. | `/motion/5eb82f94-2b98-4e4a-ab4b-ee6c872fb2c7` | {{shot:/motion/5eb82f94-2b98-4e4a-ab4b-ee6c872fb2c7}} |
| Camera move | Glam | High-speed camera sweeps around the subject in slow motion. | `/motion/5763f4ec-ea6b-449d-9509-4596962668a8` | {{shot:/motion/5763f4ec-ea6b-449d-9509-4596962668a8}} |
| Camera move | Glam | High-speed camera sweeps around the subject in slow motion. | `/motion/ae4a319d-a06f-4b30-8b67-55a35a22f24a` | {{shot:/motion/ae4a319d-a06f-4b30-8b67-55a35a22f24a}} |
| Camera move | Handheld | Natural handheld shake for a raw feel. Top choice. | `/motion/15e8358d-335d-4e7a-8eaa-277325ab728f` | {{shot:/motion/15e8358d-335d-4e7a-8eaa-277325ab728f}} |
| Camera move | Handheld | Natural handheld shake for a raw feel. Top choice. | `/motion/36e6e450-52d9-484f-bfbe-f069e06a1530` | {{shot:/motion/36e6e450-52d9-484f-bfbe-f069e06a1530}} |
| Camera move | Head Tracking | Camera locked to the head while the background shifts. | `/motion/5a6b5390-6605-4786-86e6-c6703ce44bbe` | {{shot:/motion/5a6b5390-6605-4786-86e6-c6703ce44bbe}} |
| Camera move | Head Tracking | Camera locked to the head while the background shifts. | `/motion/fe520e06-7971-4f28-9e10-e45911c57bb6` | {{shot:/motion/fe520e06-7971-4f28-9e10-e45911c57bb6}} |
| Camera move | Jib Down | Camera moves gently down onto the subject. | `/motion/2057206c-09ef-40b2-9cc9-049e41a0b8bb` | {{shot:/motion/2057206c-09ef-40b2-9cc9-049e41a0b8bb}} |
| Camera move | Jib Down | Camera moves gently down onto the subject. | `/motion/cd68bb84-f0f5-4e2a-bfbf-b06e7949fc43` | {{shot:/motion/cd68bb84-f0f5-4e2a-bfbf-b06e7949fc43}} |
| Camera move | Jib Up | Camera lifts straight up to show height. | `/motion/c22b1586-837b-480f-a456-d4e8ba9c3a4b` | {{shot:/motion/c22b1586-837b-480f-a456-d4e8ba9c3a4b}} |
| Camera move | Jib Up | Camera lifts straight up to show height. | `/motion/d6b43086-d5d1-415b-a239-016698b425d7` | {{shot:/motion/d6b43086-d5d1-415b-a239-016698b425d7}} |
| Camera move | Lazy Susan | Camera turns around a still subject like a turntable. | `/motion/025866ff-677c-4af2-92ef-52d6ec3b035e` | {{shot:/motion/025866ff-677c-4af2-92ef-52d6ec3b035e}} |
| Camera move | Lazy Susan | Camera turns around a still subject like a turntable. | `/motion/692c5527-3580-4c65-adfd-c47c6dc1f975` | {{shot:/motion/692c5527-3580-4c65-adfd-c47c6dc1f975}} |
| Camera move | Lazy Susan + Super Dolly Out | Mix: rotates around the subject while pulling away. | `/motion/71e3e642-561f-46d9-b9af-8af420f99685` | {{shot:/motion/71e3e642-561f-46d9-b9af-8af420f99685}} |
| Camera move | Lazy Susan + Super Dolly Out | Mix: rotates around the subject while pulling away. | `/motion/bf81db64-714e-4195-acd4-21065b317dd4` | {{shot:/motion/bf81db64-714e-4195-acd4-21065b317dd4}} |
| Camera move | Mouth In | Quick zoom into the mouth for a comic or surreal beat. | `/motion/7351a8ad-9754-4844-94f1-00baf293d588` | {{shot:/motion/7351a8ad-9754-4844-94f1-00baf293d588}} |
| Camera move | Mouth In | Quick zoom into the mouth for a comic or surreal beat. | `/motion/dfeb0656-5d12-474c-87cd-1c80e94abdf2` | {{shot:/motion/dfeb0656-5d12-474c-87cd-1c80e94abdf2}} |
| Camera move | Object POV | Shows the scene from an object's point of view. | `/motion/76a7036d-2f69-4e0b-82fe-c91f9d7a71aa` | {{shot:/motion/76a7036d-2f69-4e0b-82fe-c91f9d7a71aa}} |
| Camera move | Object POV | Shows the scene from an object's point of view. | `/motion/ab14b29d-f23e-449e-a40e-ebdbb4f7437a` | {{shot:/motion/ab14b29d-f23e-449e-a40e-ebdbb4f7437a}} |
| Camera move | Overhead | Top-down camera that tracks the subject. | `/motion/b6395b91-a356-4bc6-9cda-fc2793b3d706` | {{shot:/motion/b6395b91-a356-4bc6-9cda-fc2793b3d706}} |
| Camera move | Overhead | Top-down camera that tracks the subject. | `/motion/cdb0b964-5bd6-4a26-8ae6-7fe605a28dc9` | {{shot:/motion/cdb0b964-5bd6-4a26-8ae6-7fe605a28dc9}} |
| Camera move | Rap Flex | Rap video moves: slides, low angles and slow zooms. | `/motion/809c1acb-6be5-4eb7-afde-dd08910f1e90` | {{shot:/motion/809c1acb-6be5-4eb7-afde-dd08910f1e90}} |
| Camera move | Rap Flex | Rap video moves: slides, low angles and slow zooms. | `/motion/dc292dd4-12aa-431a-a576-48adb132dd55` | {{shot:/motion/dc292dd4-12aa-431a-a576-48adb132dd55}} |
| Camera move | Robo Arm | Fast, precise robotic camera sweeps. | `/motion/1bd4363a-6e5a-4c57-90a5-30f0733a769b` | {{shot:/motion/1bd4363a-6e5a-4c57-90a5-30f0733a769b}} |
| Camera move | Robo Arm | Fast, precise robotic camera sweeps. | `/motion/6fef255d-cdd6-4463-b025-a42646866c1c` | {{shot:/motion/6fef255d-cdd6-4463-b025-a42646866c1c}} |
| Camera move | Snorricam | Camera rigged to the subject so the world bobs with each step. Top choice. | `/motion/505dec12-80c5-43bf-99b1-134e3f3e53a0` | {{shot:/motion/505dec12-80c5-43bf-99b1-134e3f3e53a0}} |
| Camera move | Snorricam | Camera rigged to the subject so the world bobs with each step. Top choice. | `/motion/893cb65f-c528-40aa-83d8-c5aeb2bfe59f` | {{shot:/motion/893cb65f-c528-40aa-83d8-c5aeb2bfe59f}} |
| Camera move | Static | Locked-off camera with no movement. Top choice. | `/motion/aab8440c-0d65-4554-b88a-7a9a5e084b6e` | {{shot:/motion/aab8440c-0d65-4554-b88a-7a9a5e084b6e}} |
| Camera move | Static | Locked-off camera with no movement. Top choice. | `/motion/fffe5dfd-f63b-4659-b7dd-e45f9c7d4ea2` | {{shot:/motion/fffe5dfd-f63b-4659-b7dd-e45f9c7d4ea2}} |
| Camera move | Super Dolly In | Long, straight push toward the subject. | `/motion/1c2140b0-0847-4a74-a3d9-f0298aec817d` | {{shot:/motion/1c2140b0-0847-4a74-a3d9-f0298aec817d}} |
| Camera move | Super Dolly In | Long, straight push toward the subject. | `/motion/6a6fb1b9-28ea-44c8-9be4-e5d8c6ab1f3a` | {{shot:/motion/6a6fb1b9-28ea-44c8-9be4-e5d8c6ab1f3a}} |
| Camera move | Super Dolly Out | Long, straight pull away from the subject. | `/motion/9dda3fb8-b917-457a-a995-72233031b1fd` | {{shot:/motion/9dda3fb8-b917-457a-a995-72233031b1fd}} |
| Camera move | Super Dolly Out | Long, straight pull away from the subject. | `/motion/d66685ce-8c2b-4aeb-8d4a-195d474c7eca` | {{shot:/motion/d66685ce-8c2b-4aeb-8d4a-195d474c7eca}} |
| Camera move | Through Object In | Camera passes through an object to reach the subject. | `/motion/2b353671-da2e-4c9e-841d-b7af200ceadb` | {{shot:/motion/2b353671-da2e-4c9e-841d-b7af200ceadb}} |
| Camera move | Through Object In | Camera passes through an object to reach the subject. | `/motion/ae7a6c18-0db0-4c17-817b-fe73b10da520` | {{shot:/motion/ae7a6c18-0db0-4c17-817b-fe73b10da520}} |
| Camera move | Through Object Out | Camera exits through an object to reveal the scene. | `/motion/0b75acee-a00e-4009-a7a3-8fe394f13864` | {{shot:/motion/0b75acee-a00e-4009-a7a3-8fe394f13864}} |
| Camera move | Through Object Out | Camera exits through an object to reveal the scene. | `/motion/3e217f3c-5133-4e83-ab6c-afb35d1c5852` | {{shot:/motion/3e217f3c-5133-4e83-ab6c-afb35d1c5852}} |
| Camera move | Tilt Down | Camera angles down to reveal what is below. | `/motion/1958a932-8ffb-4f1a-a5cd-480858f6ae84` | {{shot:/motion/1958a932-8ffb-4f1a-a5cd-480858f6ae84}} |
| Camera move | Tilt up | Camera angles up so the subject feels grand. | `/motion/359bd4f6-252a-405e-bb5c-3807b3b9d9ec` | {{shot:/motion/359bd4f6-252a-405e-bb5c-3807b3b9d9ec}} |
| Camera move | Tilt up | Camera angles up so the subject feels grand. | `/motion/9f127dad-0db0-4e3d-a440-3cfbffca30b6` | {{shot:/motion/9f127dad-0db0-4e3d-a440-3cfbffca30b6}} |
| Camera move | Whip Pan | Very fast pan with heavy motion blur. | `/motion/7a144766-cdd2-4b73-8a27-67b35f2d4ba2` | {{shot:/motion/7a144766-cdd2-4b73-8a27-67b35f2d4ba2}} |
| Camera move | Whip Pan | Very fast pan with heavy motion blur. | `/motion/a3f2c5eb-2fe1-493c-a4b0-b40c46a3a48b` | {{shot:/motion/a3f2c5eb-2fe1-493c-a4b0-b40c46a3a48b}} |
| Camera move | Wiggle | Playful slight shake layered on a zoom or pan. | `/motion/cfbe9732-1b5a-4f59-9dbc-801f85f5c702` | {{shot:/motion/cfbe9732-1b5a-4f59-9dbc-801f85f5c702}} |
| Camera move | Wiggle | Playful slight shake layered on a zoom or pan. | `/motion/fbc42e4f-222c-4c79-a5f2-b3a23d169376` | {{shot:/motion/fbc42e4f-222c-4c79-a5f2-b3a23d169376}} |
| Camera move | YoYo Zoom | Rapid zoom in and straight back out. | `/motion/0da141c0-0d0a-4e70-928b-3f61888f067d` | {{shot:/motion/0da141c0-0d0a-4e70-928b-3f61888f067d}} |
| Camera move | YoYo Zoom | Rapid zoom in and straight back out. | `/motion/702c6210-9798-4888-b7c9-e794c8fcaaef` | {{shot:/motion/702c6210-9798-4888-b7c9-e794c8fcaaef}} |
| Camera move | Zoom In | Gradual zoom toward the subject. | `/motion/223929fa-99b1-4a61-a454-90226684901b` | {{shot:/motion/223929fa-99b1-4a61-a454-90226684901b}} |
| Camera move | Zoom In | Gradual zoom toward the subject. | `/motion/a3a3db5d-d3c5-4d95-b429-235ae3d1ee82` | {{shot:/motion/a3a3db5d-d3c5-4d95-b429-235ae3d1ee82}} |
| Camera move | Zoom Out | Gradual zoom out to show more of the scene. | `/motion/b731109c-5856-436f-b269-b44b75f20945` | {{shot:/motion/b731109c-5856-436f-b269-b44b75f20945}} |
| Camera move | Zoom Out | Gradual zoom out to show more of the scene. | `/motion/f9e6792f-b385-4eca-87f6-f439e917a7aa` | {{shot:/motion/f9e6792f-b385-4eca-87f6-f439e917a7aa}} |
| Camera effect | Bullet Time | Action freezes or slows while the camera moves around it. Top choice. | `/motion/855c5272-8f39-48b7-a362-e1337590387f` | {{shot:/motion/855c5272-8f39-48b7-a362-e1337590387f}} |
| Camera effect | Bullet Time | Action freezes or slows while the camera moves around it. Top choice. | `/motion/9312c53a-f191-4aab-94fb-6b1dbdfdc946` | {{shot:/motion/9312c53a-f191-4aab-94fb-6b1dbdfdc946}} |
| Camera effect | Dirty Lens | Smudges, dust or water drops on the lens. | `/motion/635e322f-f711-4a4b-98b8-c1b62d7befe9` | {{shot:/motion/635e322f-f711-4a4b-98b8-c1b62d7befe9}} |
| Camera effect | Dirty Lens | Smudges, dust or water drops on the lens. | `/motion/86b3d8dd-78e2-4c84-9ca3-5a5b3c5a6382` | {{shot:/motion/86b3d8dd-78e2-4c84-9ca3-5a5b3c5a6382}} |
| Camera effect | Dutch Angle | Tilted horizon for tension or unease. | `/motion/28a18555-b8ed-4cac-aad6-40ecaaad9345` | {{shot:/motion/28a18555-b8ed-4cac-aad6-40ecaaad9345}} |
| Camera effect | Dutch Angle | Tilted horizon for tension or unease. | `/motion/b593944e-ae3e-47ce-8c6d-ea8dd87fe01f` | {{shot:/motion/b593944e-ae3e-47ce-8c6d-ea8dd87fe01f}} |
| Camera effect | Fisheye | Wide, curved fisheye distortion. | `/motion/6c689fc3-e421-4ed5-892c-2092d1c60be0` | {{shot:/motion/6c689fc3-e421-4ed5-892c-2092d1c60be0}} |
| Camera effect | Fisheye | Wide, curved fisheye distortion. | `/motion/a5915704-2b92-476b-b67b-3a1394c613cd` | {{shot:/motion/a5915704-2b92-476b-b67b-3a1394c613cd}} |
| Camera effect | Focus Change | Focus shifts from one subject to another. | `/motion/0753d80c-7369-4682-b725-8729ab638224` | {{shot:/motion/0753d80c-7369-4682-b725-8729ab638224}} |
| Camera effect | Focus Change | Focus shifts from one subject to another. | `/motion/390e084a-4a80-410b-a808-77411828c61d` | {{shot:/motion/390e084a-4a80-410b-a808-77411828c61d}} |
| Camera effect | FPV Drone + Timelapse Landscape | Mix: drone flight over a landscape in sped-up time. | `/motion/4f016058-bdcf-450b-9ec1-273fb98c927c` | {{shot:/motion/4f016058-bdcf-450b-9ec1-273fb98c927c}} |
| Camera effect | FPV Drone + Timelapse Landscape | Mix: drone flight over a landscape in sped-up time. | `/motion/7018b2c3-a855-4836-959c-44b6ca0097c8` | {{shot:/motion/7018b2c3-a855-4836-959c-44b6ca0097c8}} |
| Camera effect | Hyperlapse | Moving time-lapse that travels through the scene. | `/motion/2dec4bb0-5d8d-4a2d-bd9f-242ec613a9fb` | {{shot:/motion/2dec4bb0-5d8d-4a2d-bd9f-242ec613a9fb}} |
| Camera effect | Hyperlapse | Moving time-lapse that travels through the scene. | `/motion/f0f07997-34fe-4bef-84c1-ee9d4da94a1a` | {{shot:/motion/f0f07997-34fe-4bef-84c1-ee9d4da94a1a}} |
| Camera effect | Incline | The world tilts steeply around the subject. | `/motion/342d9ac9-ecd1-4c7b-a3a2-ac6e3423d302` | {{shot:/motion/342d9ac9-ecd1-4c7b-a3a2-ac6e3423d302}} |
| Camera effect | Incline | The world tilts steeply around the subject. | `/motion/b120f292-74e3-4878-817b-626e203f8a92` | {{shot:/motion/b120f292-74e3-4878-817b-626e203f8a92}} |
| Camera effect | Lens Crack | Cracked lens with fractures and light distortion. | `/motion/a7984a1f-f2ed-41a8-8a4c-4a66606ac6bb` | {{shot:/motion/a7984a1f-f2ed-41a8-8a4c-4a66606ac6bb}} |
| Camera effect | Lens Flare | Light streaks and spots across the lens. | `/motion/53384cbd-e077-4668-b3fe-1ff771564f56` | {{shot:/motion/53384cbd-e077-4668-b3fe-1ff771564f56}} |
| Camera effect | Lens Flare | Light streaks and spots across the lens. | `/motion/97687e52-2cfc-4073-ae62-a00c057c2aa2` | {{shot:/motion/97687e52-2cfc-4073-ae62-a00c057c2aa2}} |
| Camera effect | Low Shutter | Slow shutter blur and streaks. | `/motion/f7949a2f-2bcd-459a-96c0-80eb222abcdc` | {{shot:/motion/f7949a2f-2bcd-459a-96c0-80eb222abcdc}} |
| Camera effect | Low Shutter | Slow shutter blur and streaks. | `/motion/fe85971a-92e3-4c85-ac20-b4ecebaf1567` | {{shot:/motion/fe85971a-92e3-4c85-ac20-b4ecebaf1567}} |
| Camera effect | Snorricam + Low Shutter | Mix: subject locked in frame while the world smears. | `/motion/7c3b76f5-92b7-4629-8b6f-c8f9042635bf` | {{shot:/motion/7c3b76f5-92b7-4629-8b6f-c8f9042635bf}} |
| Camera effect | Snorricam + Low Shutter | Mix: subject locked in frame while the world smears. | `/motion/a3ce0054-2745-40e9-99b8-29977324bff1` | {{shot:/motion/a3ce0054-2745-40e9-99b8-29977324bff1}} |
| Camera effect | Timelapse Human | People move at high speed while the setting stays normal. | `/motion/b8789aa0-bced-4d69-9eca-7245ee9ce7db` | {{shot:/motion/b8789aa0-bced-4d69-9eca-7245ee9ce7db}} |
| Camera effect | Timelapse Human | People move at high speed while the setting stays normal. | `/motion/c4ce82e4-1426-46b4-b184-db8f7fe41a5f` | {{shot:/motion/c4ce82e4-1426-46b4-b184-db8f7fe41a5f}} |
| Camera effect | Timelapse Landscape | Clouds, light and crowds race by over time. | `/motion/128ab1d9-f6d3-4a06-8a5c-ba47f16e37ed` | {{shot:/motion/128ab1d9-f6d3-4a06-8a5c-ba47f16e37ed}} |
| Camera effect | Timelapse Landscape | Clouds, light and crowds race by over time. | `/motion/51ef3ada-73fd-4663-a406-48f3ff6d2def` | {{shot:/motion/51ef3ada-73fd-4663-a406-48f3ff6d2def}} |
| Transition | Roll Transition | Scene rolls forward like a wheel from the start frame to the end frame. | `/motion/8c4f184b-bccb-40ea-9c72-24793b8233ab` | {{shot:/motion/8c4f184b-bccb-40ea-9c72-24793b8233ab}} |
| Transition | Roll Transition | Scene rolls forward like a wheel from the start frame to the end frame. | `/motion/a8e2bc3a-e78e-42aa-a0e6-79bc01141ed3` | {{shot:/motion/a8e2bc3a-e78e-42aa-a0e6-79bc01141ed3}} |
| Character action | Action Run | Follows the subject sprinting with shaky, dynamic angles. | `/motion/89ee6db9-a56e-48e6-bdd4-806c528b3ba5` | {{shot:/motion/89ee6db9-a56e-48e6-bdd4-806c528b3ba5}} |
| Character action | Action Run | Follows the subject sprinting with shaky, dynamic angles. | `/motion/c9feeb46-e10b-4199-a369-100bfd543725` | {{shot:/motion/c9feeb46-e10b-4199-a369-100bfd543725}} |
| Character action | Baseball Kick | A powerful high kick with fast leg motion. | `/motion/c2ece0f5-8775-4f8e-924b-b134907b51ad` | {{shot:/motion/c2ece0f5-8775-4f8e-924b-b134907b51ad}} |
| Character action | Basketball Dunks | Subject leaps and slams a basketball home. | `/motion/c7d10f77-969d-4145-bcaf-b373b6f0541d` | {{shot:/motion/c7d10f77-969d-4145-bcaf-b373b6f0541d}} |
| Character action | Basketball Dunks | Subject leaps and slams a basketball home. | `/motion/ef9d53c6-1d26-4671-950e-ef2bd2a5b778` | {{shot:/motion/ef9d53c6-1d26-4671-950e-ef2bd2a5b778}} |
| Character action | Boxing | Quick jabs, hooks and head movement. | `/motion/17a55db6-8775-4a9f-a2c9-d0d373bee590` | {{shot:/motion/17a55db6-8775-4a9f-a2c9-d0d373bee590}} |
| Character action | Catwalk | Tracks a confident runway walk. | `/motion/a0a7c624-cf2a-4204-a9f8-60623d4a7383` | {{shot:/motion/a0a7c624-cf2a-4204-a9f8-60623d4a7383}} |
| Character action | Crash Zoom In + Face Punch | Mix: zoom punches in as a blow lands. | `/motion/b58e69b3-a23a-4e5b-8901-f5b170a7755c` | {{shot:/motion/b58e69b3-a23a-4e5b-8901-f5b170a7755c}} |
| Character action | Downhill POV | First-person ride down a slope with bumps and turns. | `/motion/67a2ba8e-7f5a-4969-95f8-1326f44ba784` | {{shot:/motion/67a2ba8e-7f5a-4969-95f8-1326f44ba784}} |
| Character action | Face Punch | A punch lands on the subject's face. Top choice. | `/motion/91da0dd0-c8e1-4793-b77e-946e98bc7ebb` | {{shot:/motion/91da0dd0-c8e1-4793-b77e-946e98bc7ebb}} |
| Character action | Face Punch | A punch lands on the subject's face. Top choice. | `/motion/cd5bfd11-5a1a-46e0-9294-b22b0b733b1e` | {{shot:/motion/cd5bfd11-5a1a-46e0-9294-b22b0b733b1e}} |
| Character action | Kiss | An intimate kiss in soft focus or slow motion. | `/motion/38c80734-90b7-4fcb-8fc2-16a055d2b3ba` | {{shot:/motion/38c80734-90b7-4fcb-8fc2-16a055d2b3ba}} |
| Character action | Kiss | An intimate kiss in soft focus or slow motion. | `/motion/ad85a3a8-919d-45a3-8fa6-0727fc7b7fe7` | {{shot:/motion/ad85a3a8-919d-45a3-8fa6-0727fc7b7fe7}} |
| Character action | Moonwalk Left | Classic moonwalk gliding to the left. | `/motion/9ac92661-d0f7-4b5e-85b1-f3654cb4627b` | {{shot:/motion/9ac92661-d0f7-4b5e-85b1-f3654cb4627b}} |
| Character action | Moonwalk Right | Classic moonwalk gliding to the right. | `/motion/c9da59da-aabd-4fd5-a7c8-f09a1d9f9f50` | {{shot:/motion/c9da59da-aabd-4fd5-a7c8-f09a1d9f9f50}} |
| Character action | Push To Glass | Subject is squashed against an invisible pane of glass. | `/motion/aa555597-3d9b-4385-b9af-106fe7e995e2` | {{shot:/motion/aa555597-3d9b-4385-b9af-106fe7e995e2}} |
| Character action | Push To Glass | Subject is squashed against an invisible pane of glass. | `/motion/d79c48c4-38ba-45d2-ae1c-70cd5924ccc3` | {{shot:/motion/d79c48c4-38ba-45d2-ae1c-70cd5924ccc3}} |
| Character action | Skate Cruise | Relaxed street skating with no tricks. | `/motion/2f226790-7c90-4b17-be2b-b9f5ffe1510b` | {{shot:/motion/2f226790-7c90-4b17-be2b-b9f5ffe1510b}} |
| Character action | Skateboard Glide | Board rolls along in a smooth glide. | `/motion/86f0a592-515a-4a10-bffe-910c6282cb44` | {{shot:/motion/86f0a592-515a-4a10-bffe-910c6282cb44}} |
| Character action | Skateboard Ollie | Rider and board pop off the ground. | `/motion/ae714843-8507-42b3-9cdb-59661783fee5` | {{shot:/motion/ae714843-8507-42b3-9cdb-59661783fee5}} |
| Character action | Ski Carving | A skier makes clean, fast turns. | `/motion/c7b26f66-9d34-44d7-9b18-c8e679e6a391` | {{shot:/motion/c7b26f66-9d34-44d7-9b18-c8e679e6a391}} |
| Character action | Ski Powder | A skier cuts through deep powder. | `/motion/fbed32dc-6596-4abb-891e-73bfc21c8996` | {{shot:/motion/fbed32dc-6596-4abb-891e-73bfc21c8996}} |
| Character action | Snowboard Carving | Deep snowboard turns that throw up spray. | `/motion/2b17efea-9ae2-4f68-a934-3e8722abb955` | {{shot:/motion/2b17efea-9ae2-4f68-a934-3e8722abb955}} |
| Character action | Snowboard Powder | A snowboarder floats through fresh powder. | `/motion/c99c3417-31d0-47f0-8cc9-1b25dc5de023` | {{shot:/motion/c99c3417-31d0-47f0-8cc9-1b25dc5de023}} |
| VFX | Action Run + Set on Fire | Mix: subject sprints while engulfed in flames. | `/motion/cb9fcdea-32f6-42e4-b2ba-ef7d51abe8e5` | {{shot:/motion/cb9fcdea-32f6-42e4-b2ba-ef7d51abe8e5}} |
| VFX | Agent Reveal | Subject glitches and morphs into a suited agent. | `/motion/a5e7e831-c323-4f69-926f-74f31197809b` | {{shot:/motion/a5e7e831-c323-4f69-926f-74f31197809b}} |
| VFX | Agent Reveal | Subject glitches and morphs into a suited agent. | `/motion/b6eb17bb-d336-46db-99c6-34f01ae754f3` | {{shot:/motion/b6eb17bb-d336-46db-99c6-34f01ae754f3}} |
| VFX | Angel Wings | Wings unfold behind the shoulders. | `/motion/52ee95dd-087a-4f2a-b7e9-58f4d0abbef5` | {{shot:/motion/52ee95dd-087a-4f2a-b7e9-58f4d0abbef5}} |
| VFX | Black Tears | Dark liquid streams from the eyes. | `/motion/6b49273d-2164-4af4-8e38-971ad7ab6516` | {{shot:/motion/6b49273d-2164-4af4-8e38-971ad7ab6516}} |
| VFX | Bloom Mouth | Petals and flowers spill from an open mouth. | `/motion/32332330-5b5c-4dd1-913c-e39ed6dd4c43` | {{shot:/motion/32332330-5b5c-4dd1-913c-e39ed6dd4c43}} |
| VFX | Building Explosion | A building blows up and debris flies. Top choice. | `/motion/0d53b135-337d-4918-aaf4-2af7ecf4f045` | {{shot:/motion/0d53b135-337d-4918-aaf4-2af7ecf4f045}} |
| VFX | Building Explosion | A building blows up and debris flies. Top choice. | `/motion/e974bca9-c9eb-4cc8-9318-5676cc110f17` | {{shot:/motion/e974bca9-c9eb-4cc8-9318-5676cc110f17}} |
| VFX | Building Explosion + Disintegration | Mix: a blast, then the structure crumbles to dust. | `/motion/816671cd-720b-4d90-a1d4-abbcb89be8ba` | {{shot:/motion/816671cd-720b-4d90-a1d4-abbcb89be8ba}} |
| VFX | Car Chasing + Building Explosion | Mix: car chase as a building explodes beside it. | `/motion/54791805-4c3d-4878-ad38-eebded133f0b` | {{shot:/motion/54791805-4c3d-4878-ad38-eebded133f0b}} |
| VFX | Car Explosion | A car bursts into flames and debris. | `/motion/41574f0a-2e5d-4b8c-8b9d-b3fef81151a5` | {{shot:/motion/41574f0a-2e5d-4b8c-8b9d-b3fef81151a5}} |
| VFX | Car Explosion | A car bursts into flames and debris. | `/motion/e0394620-9694-441b-b3f8-a4230abcd9ac` | {{shot:/motion/e0394620-9694-441b-b3f8-a4230abcd9ac}} |
| VFX | Clone Explosion | Subject splits into copies that burst outward. | `/motion/8b781031-3212-43bb-9fdd-02ea6098758c` | {{shot:/motion/8b781031-3212-43bb-9fdd-02ea6098758c}} |
| VFX | Clone Explosion | Subject splits into copies that burst outward. | `/motion/9680aaf0-c5db-4204-833f-56f825bb350b` | {{shot:/motion/9680aaf0-c5db-4204-833f-56f825bb350b}} |
| VFX | Crash Zoom In + Tentacles | Mix: fast zoom in as tentacles come out of the eyes. | `/motion/52862ad0-ca56-4a11-bb1d-cb0ca74f7971` | {{shot:/motion/52862ad0-ca56-4a11-bb1d-cb0ca74f7971}} |
| VFX | Crash Zoom In + Tentacles | Mix: fast zoom in as tentacles come out of the eyes. | `/motion/6b658ac3-48a7-49a7-85cc-97af9ff50069` | {{shot:/motion/6b658ac3-48a7-49a7-85cc-97af9ff50069}} |
| VFX | Diamond | Body turns into faceted, sparkling diamond. | `/motion/6acb0485-93c9-47ed-8320-868837022834` | {{shot:/motion/6acb0485-93c9-47ed-8320-868837022834}} |
| VFX | Diamond | Body turns into faceted, sparkling diamond. | `/motion/8126eea1-263d-4e2a-9e27-da7296638522` | {{shot:/motion/8126eea1-263d-4e2a-9e27-da7296638522}} |
| VFX | Disintegration | Subject breaks apart into dust or particles. Top choice. | `/motion/4e981984-1cdc-4b96-a2b1-1a7c1ecb822d` | {{shot:/motion/4e981984-1cdc-4b96-a2b1-1a7c1ecb822d}} |
| VFX | Disintegration | Subject breaks apart into dust or particles. Top choice. | `/motion/eacdca06-1fe2-4402-b8d6-4dc32f2889c5` | {{shot:/motion/eacdca06-1fe2-4402-b8d6-4dc32f2889c5}} |
| VFX | Duplicate | Subject splits into identical copies. | `/motion/20b46995-5991-48e0-8fcc-6b1f5dfb4c52` | {{shot:/motion/20b46995-5991-48e0-8fcc-6b1f5dfb4c52}} |
| VFX | Duplicate | Subject splits into identical copies. | `/motion/44fb2e55-d1bf-4658-9281-55bb6317623a` | {{shot:/motion/44fb2e55-d1bf-4658-9281-55bb6317623a}} |
| VFX | Fire Breathe | Subject breathes out a burst of flame. | `/motion/fe5d8fa7-a639-4167-a819-44877788300e` | {{shot:/motion/fe5d8fa7-a639-4167-a819-44877788300e}} |
| VFX | Floating Fish | A pale blue fish swims through the air around the subject. | `/motion/66302844-ab6f-4c45-8171-807b6655148e` | {{shot:/motion/66302844-ab6f-4c45-8171-807b6655148e}} |
| VFX | Flood | Water spreads and rises to fill the space. | `/motion/2a731e66-b6c9-472a-aa7b-aa0b90960245` | {{shot:/motion/2a731e66-b6c9-472a-aa7b-aa0b90960245}} |
| VFX | Floral Eyes | Flowers blossom out of the face. | `/motion/15f877f1-ccf8-4cc3-8269-6c7cfb028259` | {{shot:/motion/15f877f1-ccf8-4cc3-8269-6c7cfb028259}} |
| VFX | Flying + Set on Fire | Mix: subject flies through the air on fire. | `/motion/33a41f25-ef9d-4340-8d2d-be3e169e77d9` | {{shot:/motion/33a41f25-ef9d-4340-8d2d-be3e169e77d9}} |
| VFX | Freezing | Subject frosts over and freezes solid. | `/motion/777f1604-afee-406d-a711-bf1e0ea23c86` | {{shot:/motion/777f1604-afee-406d-a711-bf1e0ea23c86}} |
| VFX | Freezing | Subject frosts over and freezes solid. | `/motion/8b0ab021-b240-42bd-a6b5-4e28e8f19432` | {{shot:/motion/8b0ab021-b240-42bd-a6b5-4e28e8f19432}} |
| VFX | Garden Bloom | Body gets covered in flowers and greenery. | `/motion/b25600ef-238e-448a-bb07-1ff74fd0207f` | {{shot:/motion/b25600ef-238e-448a-bb07-1ff74fd0207f}} |
| VFX | Glowing Fish | Glowing fish swim around the subject. | `/motion/c1617bb8-2077-4a83-8448-f595fdea198c` | {{shot:/motion/c1617bb8-2077-4a83-8448-f595fdea198c}} |
| VFX | Glowing Fish | Glowing fish swim around the subject. | `/motion/cc0d5c9a-4047-459f-acce-75811f0ba729` | {{shot:/motion/cc0d5c9a-4047-459f-acce-75811f0ba729}} |
| VFX | Glowshift | A soft glow surrounds the subject as they become someone else. | `/motion/17539882-734b-4726-9e9a-1b1d92f4054c` | {{shot:/motion/17539882-734b-4726-9e9a-1b1d92f4054c}} |
| VFX | Head Explosion | Head bursts in particles or fire. | `/motion/dbf3fbc1-f69c-4904-a063-104cf2998a40` | {{shot:/motion/dbf3fbc1-f69c-4904-a063-104cf2998a40}} |
| VFX | Head Explosion | Head bursts in particles or fire. | `/motion/e0eb7a70-2fe7-4547-b3d6-dea44c41d41f` | {{shot:/motion/e0eb7a70-2fe7-4547-b3d6-dea44c41d41f}} |
| VFX | Head Off | Head detaches and floats away while the body stands. | `/motion/645b3b79-f6f5-4e9b-83d7-f9dd526ac624` | {{shot:/motion/645b3b79-f6f5-4e9b-83d7-f9dd526ac624}} |
| VFX | Innerlight | Light builds and shines from inside the subject. | `/motion/30d58d76-3149-4dee-9ffa-920a7ca6eb9e` | {{shot:/motion/30d58d76-3149-4dee-9ffa-920a7ca6eb9e}} |
| VFX | Innerlight | Light builds and shines from inside the subject. | `/motion/5dacd377-f98b-4977-8603-714fe93231a8` | {{shot:/motion/5dacd377-f98b-4977-8603-714fe93231a8}} |
| VFX | Innerlight | Light builds and shines from inside the subject. | `/motion/fda76db1-9720-4e24-a289-4cbf925987fd` | {{shot:/motion/fda76db1-9720-4e24-a289-4cbf925987fd}} |
| VFX | Invisible | Subject vanishes, leaving only their movement behind. | `/motion/28a4d3d3-613a-4796-9f40-f68c7646ded5` | {{shot:/motion/28a4d3d3-613a-4796-9f40-f68c7646ded5}} |
| VFX | Invisible | Subject vanishes, leaving only their movement behind. | `/motion/30802f12-3db4-49b8-b0ab-6f0c737b252e` | {{shot:/motion/30802f12-3db4-49b8-b0ab-6f0c737b252e}} |
| VFX | Jelly Drift | Glowing jellyfish float in the air around the subject. | `/motion/61b802b1-4594-4758-9c4a-524f7bb39840` | {{shot:/motion/61b802b1-4594-4758-9c4a-524f7bb39840}} |
| VFX | Levitation | Subject rises off the ground. | `/motion/52aa7be6-854f-45cb-930c-b98d64eb593c` | {{shot:/motion/52aa7be6-854f-45cb-930c-b98d64eb593c}} |
| VFX | Levitation | Subject rises off the ground. | `/motion/b03ec615-8f3b-4058-a1b6-508ecaa27cb3` | {{shot:/motion/b03ec615-8f3b-4058-a1b6-508ecaa27cb3}} |
| VFX | Levitation + Invisible | Mix: an unseen subject rises and only clothes float. | `/motion/68962439-c1e7-4e3f-a6b9-3efc967176c7` | {{shot:/motion/68962439-c1e7-4e3f-a6b9-3efc967176c7}} |
| VFX | Medusa Gorgona | Skin hardens and cracks into grey stone. | `/motion/b157f3d0-f3d5-4b34-8fd1-ee034c43dd1c` | {{shot:/motion/b157f3d0-f3d5-4b34-8fd1-ee034c43dd1c}} |
| VFX | Medusa Gorgona | Skin hardens and cracks into grey stone. | `/motion/b969c197-7906-48cb-bb06-313470ac1028` | {{shot:/motion/b969c197-7906-48cb-bb06-313470ac1028}} |
| VFX | Melting | Subject softens and drips as if in great heat. | `/motion/d8c13031-7117-4a3d-9a30-6a00d0d408b4` | {{shot:/motion/d8c13031-7117-4a3d-9a30-6a00d0d408b4}} |
| VFX | Melting | Subject softens and drips as if in great heat. | `/motion/ed15397e-0a3d-49e3-add4-b9529698a8ad` | {{shot:/motion/ed15397e-0a3d-49e3-add4-b9529698a8ad}} |
| VFX | Morphskin | Skin ripples as the body morphs into a new identity. | `/motion/6308a9a6-877d-4fb1-be21-481638833983` | {{shot:/motion/6308a9a6-877d-4fb1-be21-481638833983}} |
| VFX | Paint Splash | Subject bursts into splashing liquid paint. | `/motion/a1ee18d7-3705-4218-a05e-45b31badf04f` | {{shot:/motion/a1ee18d7-3705-4218-a05e-45b31badf04f}} |
| VFX | Paint Splash | Subject bursts into splashing liquid paint. | `/motion/e520303a-70ed-4438-9306-830528fbdd29` | {{shot:/motion/e520303a-70ed-4438-9306-830528fbdd29}} |
| VFX | Paparazzi | Camera flashes burst all around the subject. | `/motion/338774b2-47b1-4974-b0c6-ddc12488c468` | {{shot:/motion/338774b2-47b1-4974-b0c6-ddc12488c468}} |
| VFX | Paparazzi | Camera flashes burst all around the subject. | `/motion/3d87df66-7d1e-4d1d-a3b1-faf901bdcaac` | {{shot:/motion/3d87df66-7d1e-4d1d-a3b1-faf901bdcaac}} |
| VFX | Powder Explosion | Colored powder erupts around the subject. | `/motion/3ef68ba5-f61d-4e1b-8169-0910a10cf7b5` | {{shot:/motion/3ef68ba5-f61d-4e1b-8169-0910a10cf7b5}} |
| VFX | Powder Explosion | Colored powder erupts around the subject. | `/motion/fc56f780-079b-4a4f-b135-09384440fe75` | {{shot:/motion/fc56f780-079b-4a4f-b135-09384440fe75}} |
| VFX | Sand Storm | Sand blasts through and engulfs the scene. | `/motion/09b064d1-7a1e-4069-aca2-eca33ee06bca` | {{shot:/motion/09b064d1-7a1e-4069-aca2-eca33ee06bca}} |
| VFX | Sand Storm | Sand blasts through and engulfs the scene. | `/motion/69f79677-5ca2-4481-99f0-562881316b7e` | {{shot:/motion/69f79677-5ca2-4481-99f0-562881316b7e}} |
| VFX | Set on Fire | Subject bursts into flames. | `/motion/06b50d3a-65a9-432b-bf0b-493fc3dcc006` | {{shot:/motion/06b50d3a-65a9-432b-bf0b-493fc3dcc006}} |
| VFX | Set on Fire | Subject bursts into flames. | `/motion/fdc223d4-9402-47c6-9e07-5801985b450e` | {{shot:/motion/fdc223d4-9402-47c6-9e07-5801985b450e}} |
| VFX | Skin Surge | Hands, flowers or other forms push out through the skin. | `/motion/a03dfa10-3e92-43ed-a76a-fe9ba1395520` | {{shot:/motion/a03dfa10-3e92-43ed-a76a-fe9ba1395520}} |
| VFX | Skin Surge | Hands, flowers or other forms push out through the skin. | `/motion/aae6a422-fee1-4b89-ac7a-aea5d484fc1b` | {{shot:/motion/aae6a422-fee1-4b89-ac7a-aea5d484fc1b}} |
| VFX | Soul Jump | The soul leaps out of the body. | `/motion/2650aad0-190e-4574-bde6-8378071a4d7c` | {{shot:/motion/2650aad0-190e-4574-bde6-8378071a4d7c}} |
| VFX | Soul Jump | The soul leaps out of the body. | `/motion/b8c1c065-2d00-4583-ac52-4e89ec2d2641` | {{shot:/motion/b8c1c065-2d00-4583-ac52-4e89ec2d2641}} |
| VFX | Tentacles | Tentacles writhe out of the eyes. | `/motion/8fccea16-08b5-432c-8123-8456523e2d60` | {{shot:/motion/8fccea16-08b5-432c-8123-8456523e2d60}} |
| VFX | Tentacles | Tentacles writhe out of the eyes. | `/motion/df6600e1-387d-44e8-a8cb-96762a6ee8de` | {{shot:/motion/df6600e1-387d-44e8-a8cb-96762a6ee8de}} |
| VFX | Thunder God | Eyes glow and lightning flickers around the subject. | `/motion/52101885-ad45-4469-a885-ced767318452` | {{shot:/motion/52101885-ad45-4469-a885-ced767318452}} |
| VFX | Thunder God | Eyes glow and lightning flickers around the subject. | `/motion/ca0568ee-6a0f-4134-a4ee-97dfe44753ba` | {{shot:/motion/ca0568ee-6a0f-4134-a4ee-97dfe44753ba}} |
| VFX | Thunder God + Levitation | Mix: subject rises into the air amid lightning. | `/motion/8abe6573-591e-446a-9278-1f9bd274c03e` | {{shot:/motion/8abe6573-591e-446a-9278-1f9bd274c03e}} |
| VFX | Thunder God + Turning Metal | Mix: subject turns to metal amid lightning. | `/motion/c839c180-cf06-4924-8ad5-ddea18c97122` | {{shot:/motion/c839c180-cf06-4924-8ad5-ddea18c97122}} |
| VFX | Thunder God + Wind to Face | Mix: lightning eyes while wind blasts the face. | `/motion/4c43bd7f-9800-42ab-91c5-86afd3959080` | {{shot:/motion/4c43bd7f-9800-42ab-91c5-86afd3959080}} |
| VFX | Turning Metal | Skin turns into reflective chrome, silver or gold. Top choice. | `/motion/46e23a6b-1047-40f1-9cf5-33f5f55ddf2e` | {{shot:/motion/46e23a6b-1047-40f1-9cf5-33f5f55ddf2e}} |
| VFX | Turning Metal | Skin turns into reflective chrome, silver or gold. Top choice. | `/motion/ad8bffe9-17a9-493d-944d-7fe47275c663` | {{shot:/motion/ad8bffe9-17a9-493d-944d-7fe47275c663}} |
| VFX | Turning Metal + Eyes In | Mix: metal spreads as the camera pushes into chrome eyes. | `/motion/7e7d313e-1fb1-44a4-bd89-ec66e1f17ec9` | {{shot:/motion/7e7d313e-1fb1-44a4-bd89-ec66e1f17ec9}} |
| VFX | Turning Metal + Melting | Mix: subject liquefies into molten metal. | `/motion/017ae2b7-bcff-42ef-863e-6e198f96c3ec` | {{shot:/motion/017ae2b7-bcff-42ef-863e-6e198f96c3ec}} |
| VFX | Wind to Face | Fierce wind whips hair, clothes and body. | `/motion/080d9f40-110d-4e74-bc93-bc4e9a9032d5` | {{shot:/motion/080d9f40-110d-4e74-bc93-bc4e9a9032d5}} |
| VFX | Wind to Face | Fierce wind whips hair, clothes and body. | `/motion/52d0b18d-c098-4526-b576-b2838d34855e` | {{shot:/motion/52d0b18d-c098-4526-b576-b2838d34855e}} |
| Style | Datamosh | Glitchy pixel smearing that bleeds between frames. | `/motion/007f9809-c63e-4f65-9976-3001cf699784` | {{shot:/motion/007f9809-c63e-4f65-9976-3001cf699784}} |
| Style | Datamosh | Glitchy pixel smearing that bleeds between frames. | `/motion/1ec9ecaf-4e47-48c7-943c-5c2d651d7ad1` | {{shot:/motion/1ec9ecaf-4e47-48c7-943c-5c2d651d7ad1}} |
| Other | General | All-purpose natural camera with no set move. Top choice. | `/motion/6e4e30fb-fe99-4df7-b3ab-10e16c6e0218` | {{shot:/motion/6e4e30fb-fe99-4df7-b3ab-10e16c6e0218}} |
| Other | General | All-purpose natural camera with no set move. Top choice. | `/motion/d2389a9a-91c2-4276-bc9c-c9e35e8fb85a` | {{shot:/motion/d2389a9a-91c2-4276-bc9c-c9e35e8fb85a}} |

#### Category counts

- Camera move: 95 pages, 49 distinct presets
- Camera effect: 27 pages, 14 distinct presets
- Transition: 2 pages, 1 distinct preset
- Character action: 24 pages, 19 distinct presets
- VFX: 77 pages, 49 distinct presets
- Style: 2 pages, 1 distinct preset
- Other: 2 pages, 1 distinct preset
- Total: 229 pages, 134 distinct presets, including 16 Mix pairs on 21 pages

### Effects hub

`/effects` (titled Visual Effects) is the current effects hub. The top navigation labels it Effects with a New badge, other pages' menus describe Effects 2.0 as "every viral preset and trending format", and the ChatGPT extension's `/effects` command opens Viral Presets. Each effect has a generator page at `/effects/use/<slug>` and a gallery at `/effects/examples/<slug>`. The generator page did not finish loading in our capture ("Loading effects"), so per-effect inputs come from the blog.

The hub lists 45 distinct effects. Some cards repeat (Infinite Clones three times; Eyes In, Cutout, Floating Fall and Vanish twice). Five slugs end in `-exported` (Earth Zoom, Mighty Fighter, Moonwalk, Blue Depth, Fairytale Castle), which suggests they were carried over from the older Motion library. Seven cards show Generate instead of Try for free, and all seven share their names with Mixed Media looks (Comic, Particles, Canvas, Tracking, LSD, Windows, Palette). So the hub mixes photo-to-video presets with video restyles. The hub gives no descriptions. Where a line below is marked as inferred from the name, we guessed from the title alone; descriptions for the newest batch come from the Viral Presets blog post.

| Effect | What it does | Type | Use | Examples |
| --- | --- | --- | --- | --- |
| Floating Fall | Subject drifts down through open sky. (inferred from the name) | Photo to video | `/effects/use/floating-fall` | `/effects/examples/floating-fall` |
| High Flip | Subject springs into a high flip. (inferred from the name) | Photo to video | `/effects/use/high-flip` | `/effects/examples/high-flip` |
| Burning Man | Subject catches fire. (inferred from the name) | Photo to video | `/effects/use/burning-man` | `/effects/examples/burning-man` |
| Scrapbook Collage | Photo becomes a cut and paste scrapbook collage. (inferred from the name) | Photo to video | `/effects/use/scrapbook-collage` | `/effects/examples/scrapbook-collage` |
| Comic | Illustrated comic book look. | Mixed media look | `/effects/use/comic` | `/effects/examples/comic` |
| Frozen in Motion | The moment freezes mid action. (inferred from the name) | Photo to video | `/effects/use/frozen-in-motion` | `/effects/examples/frozen-in-motion` |
| Particles | Luminous particles move through the shot. | Mixed media look | `/effects/use/particles` | `/effects/examples/particles` |
| Pigeons | Builds an absurd street scene around your photo. New badge. | Photo to video | `/effects/use/pigeons` | `/effects/examples/pigeons` |
| Pearl Earring | Puts you in Vermeer's Girl with a Pearl Earring, split screen with the original. New badge. | Photo to video | `/effects/use/pearl-earring` | `/effects/examples/pearl-earring` |
| Studio Slide | The background slides away to a photo studio. (inferred from the name) | Photo to video | `/effects/use/studio-slide` | `/effects/examples/studio-slide` |
| Incline | The world tilts steeply around the subject. (inferred from the name) | Photo to video | `/effects/use/incline` | `/effects/examples/incline` |
| Act Natural | Not described in the capture. | Photo to video | `/effects/use/act-natural` | `/effects/examples/act-natural` |
| Monster Dab | A monster appears and dabs. (inferred from the name) | Photo to video | `/effects/use/monster-dab` | `/effects/examples/monster-dab` |
| Clones | Subject multiplies into copies. (inferred from the name) | Photo to video | `/effects/use/clones` | `/effects/examples/clones` |
| Earth Zoom | Pulls back from the subject out to the whole Earth. (inferred from the name) | Photo to video | `/effects/use/earth-zoom-exported` | `/effects/examples/earth-zoom-exported` |
| Cutout | Subject is cut out as a flat shape. (inferred from the name) | Photo to video | `/effects/use/cutout` | `/effects/examples/cutout` |
| Mighty Fighter | Subject becomes a fighter character. (inferred from the name) | Photo to video | `/effects/use/mighty-fighter-exported` | `/effects/examples/mighty-fighter-exported` |
| Vanish | Subject disappears from the shot. (inferred from the name) | Photo to video | `/effects/use/vanish` | `/effects/examples/vanish` |
| Moonwalk | Subject moonwalks across the frame. (inferred from the name) | Photo to video | `/effects/use/moonwalk-exported` | `/effects/examples/moonwalk-exported` |
| Eyes In | Camera dives into an eye. (inferred from the name) | Photo to video | `/effects/use/eyes-in` | `/effects/examples/eyes-in` |
| Street Colossus | Subject towers over a street as a giant. (inferred from the name) | Photo to video | `/effects/use/street-colossus` | `/effects/examples/street-colossus` |
| Melting | Subject melts. (inferred from the name) | Photo to video | `/effects/use/melting` | `/effects/examples/melting` |
| Architecture Wave | Buildings ripple like a wave. (inferred from the name) | Photo to video | `/effects/use/architecture-wave` | `/effects/examples/architecture-wave` |
| Agamemnon | Subject steps out of a cinema screen as armored warriors storm the hall. New badge. | Photo to video | `/effects/use/agamemnon` | `/effects/examples/agamemnon` |
| Cyclope | Recreates Redon's The Cyclops with your subject. New badge. | Photo to video | `/effects/use/cyclope` | `/effects/examples/cyclope` |
| Canvas | Hand-drawn canvas artwork look. | Mixed media look | `/effects/use/canvas` | `/effects/examples/canvas` |
| Tracking | Tracking lines lock onto moving objects. | Mixed media look | `/effects/use/tracking` | `/effects/examples/tracking` |
| LSD | Waves of hallucinogenic color. | Mixed media look | `/effects/use/lsd` | `/effects/examples/lsd` |
| Blue Depth | Not described in the capture. | Photo to video | `/effects/use/blue-depth-exported` | `/effects/examples/blue-depth-exported` |
| Wild Ride | Not described in the capture. | Photo to video | `/effects/use/wild-ride` | `/effects/examples/wild-ride` |
| World Morphing | The world around the subject keeps changing. (inferred from the name) | Photo to video | `/effects/use/world-morphing` | `/effects/examples/world-morphing` |
| Stop World | Time stops around the subject. (inferred from the name) | Photo to video | `/effects/use/stop-world` | `/effects/examples/stop-world` |
| Bullet Time | Freezes an action scene for a 360 degree camera move. New badge. | Photo to video | `/effects/use/bullet-time` | `/effects/examples/bullet-time` |
| Infinite Clones | Endless copies of the subject. (inferred from the name) | Photo to video | `/effects/use/infinite-clones` | `/effects/examples/infinite-clones` |
| Superstar | Not described in the capture. | Photo to video | `/effects/use/superstar` | `/effects/examples/superstar` |
| Skatedog | A dachshund rolls down the street on a skateboard. New badge. | Photo to video | `/effects/use/skatedog` | `/effects/examples/skatedog` |
| Smash and Grab | Not described in the capture. | Photo to video | `/effects/use/smash-and-grab` | `/effects/examples/smash-and-grab` |
| Selfception | A picture inside a picture, again and again. (inferred from the name) | Photo to video | `/effects/use/selfception` | `/effects/examples/selfception` |
| Lacewalker | Not described in the capture. | Photo to video | `/effects/use/lacewalker` | `/effects/examples/lacewalker` |
| Boarding Pass | Not described in the capture. | Photo to video | `/effects/use/boarding-pass` | `/effects/examples/boarding-pass` |
| Lidar Transition | Transition through a lidar style point scan. (inferred from the name) | Photo to video | `/effects/use/lidar` | `/effects/examples/lidar` |
| Fallen Angel | Animates Cabanel's The Fallen Angel around your photo. New badge. | Photo to video | `/effects/use/fallen-angel` | `/effects/examples/fallen-angel` |
| Windows | Overlapping interface windows. | Mixed media look | `/effects/use/windows` | `/effects/examples/windows` |
| Fairytale Castle | Places the subject at a fairytale castle. (inferred from the name) | Photo to video | `/effects/use/fairytale-castle-exported` | `/effects/examples/fairytale-castle-exported` |
| Palette | Hand-painted color composition. | Mixed media look | `/effects/use/palette` | `/effects/examples/palette` |

How Effects 2.0 and Viral Presets relate:

- They are one library under two names. The blog calls it Viral Presets: more than 60 ready-made effects, each with built-in animation, location and style, refreshed to follow trends. Its latest update added 13. Seven of them carry a New badge on the hub (Agamemnon, Fallen Angel, Bullet Time, Cyclope, Pigeons, Pearl Earring, Skatedog). The other six (Monet Muse, Argus, Lost in a Book, Dolphin Ride, Penguin Ride, Puffin Ride) were not on the hub when we captured it. Another post also names Action Figure, Noir, Vintage and Knight's Diary as viral presets.
- Two families make up that update: living paintings (a split screen with the original painting below and your animated version above) and impossible rides (riding an animal that cannot be ridden), plus two cinematic reveals.
- Cost per 720p generation for the new batch runs from 27.5 credits (Pearl Earring) to 67.5 (Agamemnon, Bullet Time). Some presets stop at 720p and others go to 4K. Higgsfield pairs the library with a Virality Predictor app and with AI Influencer, which can drop a generated character straight into a viral preset.
- The older `/viral` page is a different thing: a 54-entry Motion collection that links to `/motion/<uuid>` pages. `/collection/effects` is likewise the older Motion effects collection. Higgsfield reuses the words "viral" and "effects" across both generations of the product.

### Mixed media presets (33)

Mixed Media restyles a video rather than animating a photo. The tool page (`/mixed-media`, titled "40+ AI Video Effects Library") has a template picker (Select a template, Browse Templates), an upload slot that accepts 1 to 10 seconds of video, an FPS setting (8 FPS shown), a Resolution setting (1K shown) and a Generate button, with tabs for All Presets, How it works and Community. The intro page (`/mixed-media-intro`) pitches it as an After Effects alternative for viral edits. It promises more than 40 looks across Neon, Doodle and Mixed Media styles, no prompts, and automated rotoscoping that applies the effect frame by frame. The steps are: upload a video, choose a preset, choose frame rate and resolution, optionally adjust advanced settings, then generate. Each preset page has only a name, a few-word tagline and sample clips; none names a model or a price. The look also appears as a Motion category in Marketing Studio, as an Explainer style, as an MCP skill (Editorial Motion Graphics) and, for seven looks, in the Effects hub.

Families are our own grouping: Color and light 11, Drawn and painted 8, Overlay and glitch 7, Paper and print 7.

| Family | Preset | Look | Route | Shot |
| --- | --- | --- | --- | --- |
| Color and light | Acid | Psychedelic neon color distortion. | `/mixed-media-presets/preset/b501a54d-7c2a-42f8-a47d-484cbdace0a6` | {{shot:/mixed-media-presets/preset/b501a54d-7c2a-42f8-a47d-484cbdace0a6}} |
| Color and light | Cold vision | Cold neon light and shadow. | `/mixed-media-presets/preset/d6ebc1b1-55b0-4379-8276-b46d47d8b056` | {{shot:/mixed-media-presets/preset/d6ebc1b1-55b0-4379-8276-b46d47d8b056}} |
| Color and light | Lava | Molten lava color in motion. | `/mixed-media-presets/preset/bb33da96-918c-4754-ba55-6d0dcbaf5173` | {{shot:/mixed-media-presets/preset/bb33da96-918c-4754-ba55-6d0dcbaf5173}} |
| Color and light | LSD | Hallucinogenic color waves. | `/mixed-media-presets/preset/c2b241c5-5239-4465-869f-fef60a06822e` | {{shot:/mixed-media-presets/preset/c2b241c5-5239-4465-869f-fef60a06822e}} |
| Color and light | Noir | Hard, cinematic noir lighting. | `/mixed-media-presets/preset/c92d1f34-8bc3-410a-99c4-4b8f387140ec` | {{shot:/mixed-media-presets/preset/c92d1f34-8bc3-410a-99c4-4b8f387140ec}} |
| Color and light | Ocean | Liquid sea-colored overlay. | `/mixed-media-presets/preset/19115d24-276e-4222-a23f-39cc23d9a326` | {{shot:/mixed-media-presets/preset/19115d24-276e-4222-a23f-39cc23d9a326}} |
| Color and light | Overexposed | Blown-out, extreme exposure. | `/mixed-media-presets/preset/1c79bffd-0839-42c3-90ab-2cd7e6ff4619` | {{shot:/mixed-media-presets/preset/1c79bffd-0839-42c3-90ab-2cd7e6ff4619}} |
| Color and light | Random Glow | Random bursts of glow. | `/mixed-media-presets/preset/f1706661-007e-424b-8734-b755d602d580` | {{shot:/mixed-media-presets/preset/f1706661-007e-424b-8734-b755d602d580}} |
| Color and light | Toxic | Radioactive neon color blast. | `/mixed-media-presets/preset/fd3ca94d-6c3d-443f-970b-a4e8dd7338da` | {{shot:/mixed-media-presets/preset/fd3ca94d-6c3d-443f-970b-a4e8dd7338da}} |
| Color and light | Two color | High-contrast two-tone grade. | `/mixed-media-presets/preset/ac3612ce-b1c9-4034-a04b-b46732c2d7a3` | {{shot:/mixed-media-presets/preset/ac3612ce-b1c9-4034-a04b-b46732c2d7a3}} |
| Color and light | Ultraviolet | Neon ultraviolet glow. | `/mixed-media-presets/preset/c9682e42-9891-4118-86bb-f8cf79c84055` | {{shot:/mixed-media-presets/preset/c9682e42-9891-4118-86bb-f8cf79c84055}} |
| Drawn and painted | Akrill | Layered acrylic color blocks. | `/mixed-media-presets/preset/73f9e01d-eb92-41d6-9119-53cc2686ecfa` | {{shot:/mixed-media-presets/preset/73f9e01d-eb92-41d6-9119-53cc2686ecfa}} |
| Drawn and painted | Canvas | Hand-drawn artwork on canvas. | `/mixed-media-presets/preset/1a722581-6ba0-48b2-b990-a177a3f26cc8` | {{shot:/mixed-media-presets/preset/1a722581-6ba0-48b2-b990-a177a3f26cc8}} |
| Drawn and painted | Comic | Illustrated comic book look. | `/mixed-media-presets/preset/94cd1315-c820-4314-806d-f1b0936e8a46` | {{shot:/mixed-media-presets/preset/94cd1315-c820-4314-806d-f1b0936e8a46}} |
| Drawn and painted | Flash comic | Punchy, high-energy comic panels. | `/mixed-media-presets/preset/3fbd5057-50e1-4d1d-9a6f-8655836711b8` | {{shot:/mixed-media-presets/preset/3fbd5057-50e1-4d1d-9a6f-8655836711b8}} |
| Drawn and painted | Hand paint | Loose, freehand brushwork. | `/mixed-media-presets/preset/ad8401a0-39a2-4c95-b65e-1634d41378ab` | {{shot:/mixed-media-presets/preset/ad8401a0-39a2-4c95-b65e-1634d41378ab}} |
| Drawn and painted | Palette | Hand-painted blocks of color. | `/mixed-media-presets/preset/15b97a49-9912-4a58-8424-b4ef1c302a05` | {{shot:/mixed-media-presets/preset/15b97a49-9912-4a58-8424-b4ef1c302a05}} |
| Drawn and painted | Sketch | Textured hand-drawn line work. | `/mixed-media-presets/preset/6377b231-5cea-4259-8a6b-0314728c1982` | {{shot:/mixed-media-presets/preset/6377b231-5cea-4259-8a6b-0314728c1982}} |
| Drawn and painted | Vintage | Hand-inked illustration style. | `/mixed-media-presets/preset/ee12f76c-ed17-4471-bf2e-52bda1bcae64` | {{shot:/mixed-media-presets/preset/ee12f76c-ed17-4471-bf2e-52bda1bcae64}} |
| Overlay and glitch | Broken mirror | Shattered mirror reflections. | `/mixed-media-presets/preset/5d89951e-ac83-4c7f-ac47-4d8db50c835e` | {{shot:/mixed-media-presets/preset/5d89951e-ac83-4c7f-ac47-4d8db50c835e}} |
| Overlay and glitch | Bubbles | Dreamy soap bubble texture. | `/mixed-media-presets/preset/dacdca94-27b2-417a-bc8c-6d4168e6109a` | {{shot:/mixed-media-presets/preset/dacdca94-27b2-417a-bc8c-6d4168e6109a}} |
| Overlay and glitch | Fragments | Abstract fragments layered over the image. | `/mixed-media-presets/preset/525fc0d7-abf1-49e5-a3e6-2f97eb50973c` | {{shot:/mixed-media-presets/preset/525fc0d7-abf1-49e5-a3e6-2f97eb50973c}} |
| Overlay and glitch | Multiverse | Layers of reality colliding. | `/mixed-media-presets/preset/c38c2630-3986-4e28-858f-596fd254e5e9` | {{shot:/mixed-media-presets/preset/c38c2630-3986-4e28-858f-596fd254e5e9}} |
| Overlay and glitch | Particles | Glowing particles moving through the shot. | `/mixed-media-presets/preset/386ebb9d-643f-4108-a12f-3f867f18fb36` | {{shot:/mixed-media-presets/preset/386ebb9d-643f-4108-a12f-3f867f18fb36}} |
| Overlay and glitch | Tracking | Tracking lines that follow objects. | `/mixed-media-presets/preset/9fa35d36-e5f4-4488-9068-8813bd232a22` | {{shot:/mixed-media-presets/preset/9fa35d36-e5f4-4488-9068-8813bd232a22}} |
| Overlay and glitch | Windows | Overlapping computer interface windows. | `/mixed-media-presets/preset/4f7a1589-c604-44e5-b0ec-bc87d3929906` | {{shot:/mixed-media-presets/preset/4f7a1589-c604-44e5-b0ec-bc87d3929906}} |
| Paper and print | Cannabis | Smoky psychedelic poster look. | `/mixed-media-presets/preset/c90cd302-d409-48fd-8643-36c34d7798e4` | {{shot:/mixed-media-presets/preset/c90cd302-d409-48fd-8643-36c34d7798e4}} |
| Paper and print | Layer mixed media | Stacked collage of mixed materials. | `/mixed-media-presets/preset/6ff15c8c-de78-459e-af32-e7a1266dc075` | {{shot:/mixed-media-presets/preset/6ff15c8c-de78-459e-af32-e7a1266dc075}} |
| Paper and print | Magazine | Printed magazine page look. | `/mixed-media-presets/preset/963c3300-8967-4880-b078-c956de4c1e12` | {{shot:/mixed-media-presets/preset/963c3300-8967-4880-b078-c956de4c1e12}} |
| Paper and print | Marble | Sculpted marble finish. | `/mixed-media-presets/preset/ff617894-b1bc-4931-85b3-1e5b159d2106` | {{shot:/mixed-media-presets/preset/ff617894-b1bc-4931-85b3-1e5b159d2106}} |
| Paper and print | Modern | Clean, geometric minimalism. | `/mixed-media-presets/preset/9196d356-1406-43ef-bc68-cb26e7eaf507` | {{shot:/mixed-media-presets/preset/9196d356-1406-43ef-bc68-cb26e7eaf507}} |
| Paper and print | Origami | Crisp folded-paper geometry. | `/mixed-media-presets/preset/8c88dac7-0314-40b4-b611-5dcd3fda004d` | {{shot:/mixed-media-presets/preset/8c88dac7-0314-40b4-b611-5dcd3fda004d}} |
| Paper and print | Paper | Handmade paper texture over the footage. | `/mixed-media-presets/preset/f63bf420-f98a-44e6-ba54-3f7eaa599d40` | {{shot:/mixed-media-presets/preset/f63bf420-f98a-44e6-ba54-3f7eaa599d40}} |

### Other preset libraries

| Library | Where | Count | What a preset sets | Notes |
| --- | --- | --- | --- | --- |
| Genjutsu presets | `/higgsfield-genjutsu-presets`, Video, Higgsfield Genjutsu | 30+ (blog) | A ready-made Motion transfer or Object swap applied to a source video of 4 to 30 seconds | Tabs for Higgsfield, Community trending and Community new. Up to 30 reference images, output up to 1080p. A 15 second clip costs 40, 104 or 144 credits at 480p, 720p or 1080p. Restyle (Sep 30, 2026) adds 20+ animation styles or custom styles built from references. Also sold as the Genjutsu API |
| Katana presets | `/katana`, and inside Claude through MCP (`/katana`, `/katana/<preset-name>`) | Not stated (10 cards in the capture) | A prepared reference edit: its motion, its style and a prompt that places your assets | Categories: Personalized edits, Style transfer, Motion transfer. Sources: Higgsfield or Community. The changelog names the styles Aura Farming, Motion and Clipping. Up to 5 photos per edit. A community preset needs a 3 to 30 second video, up to 40 images and a prompt that tags them with @; it goes live at once |
| Soul style presets | Image, Soul and Soul 2.0 | 20+ (21 named for Soul 2.0) | An aesthetic register for image generation | Soul groups presets as General, TikTok Core, Instagram Aesthetics, Beauty, Mood, Camera Photo and Graphic Art. Soul 2.0 names Warm Ambient, Retro BW, Y2K Street, Subtle Flash, Y2K Studio, Street Photography, Theatrical Light, Asian Nostalgia, Editorial Street Style, Surreal Solarization, Flash Editorial, Digital Camera, Siren, Swag Era, Mystique City, Balletcore, Candy Pop, 2000s Band, Frutiger Aero, Drain and Old Smartphone. Presets stack with Moodboard, Soul HEX and Soul ID. Soul Cinema has no presets |
| Camera controls | `/camera-controls` | 65 entries ("50+") | DoP camera moves | Part of the Motion library above |
| Cinema Studio presets | Cinema Studio | 30+ camera movement presets, 10 Camera MoveSet styles, 6 lighting presets, 50+ color palettes | The camera and lighting register of a shot | Named moves include POV, Robot Arm, Pan Left and Helicopter Shot. Lighting presets: Soft Cross, Overhead Fall, Contre-jour, Window, Practicals, Silhouette (plus Auto or a manual build). Genres such as Action, Epic and Noir. Users can save their own camera setups |
| Viral, UGC and Commercial collections | `/viral`, `/ugc`, `/commercial` | 54, 45, 27 | DoP presets themed for trends, creator-style clips and brand work | UGC adds names such as Outfit Check, Selfie Posing, Morning Routine and Plate Check; Commercial adds Yacht, Exploded View and Red Carpet |
| Catch the Pulse | `/collection/catch-the-pulse`, a DoP category | Not captured | A curated themed set of DoP presets | Linked from the Visual effects collection |
| Sora 2 presets | `/sora-2-ai-video-presets`, `/sora-trends/tiktok` | 10 named | Attach a photo, pick a preset, generate at 720p or 1080p | A blog post says the Sora app closed on April 26, 2026, the API retires on September 24, 2026, and these preset formats now run on Seedance 2.0. Named presets: Unpacking, Luxury Ad, Minimalist Corporate, Dynamic Sport Ad, First-Person POV with Product, Reaction, Gen-Z TikTok Edit, ASMR, Streamer Highlight, Epic Fail |
| Shorts Studio presets | `/shorts-studio` | 40+ | Pacing and visual treatment for cutting a video of up to 2 minutes into shorts | Users can build a preset from their own references |
| Explainer presets | `/explainer` | 6 named, more unnamed | Visual style and motion logic for a whole explainer | Pixel Art, Claymotion, Mixed Media, 3D Papercraft, 2D Illustrator, Whiteboard Doodle |
| Marketing Studio presets | Marketing Studio, and the product-photoshoot CLI skill | 10 image and 9 video in the skill | Ad formats | Image: product shot, lifestyle scene, close up with person, Pinterest pin, hero banner, social carousel, ad creative pack, virtual model try-on, conceptual product, restyle. Video: UGC, Tutorial, Unboxing, Hyper Motion, Product Review, TV Spot, Wild Card, UGC Virtual Try On, Pro Virtual Try On. On the web, the Motion category offers Hypermotion, 2D Product Motion, Mixed Media and Motion Design |
| Smaller pickers | AI Influencer, AI Motion Design, Lipsync Studio, Audio | Not counted | AI Influencer motion presets (Higgsfield Presets and Community Trends tabs), one-click Motion Presets for code-based motion graphics, Lipsync presets, and built-in voice presets | Higgsfield Apps, the one-click effect apps, are covered in the apps section; the app builder also offers a Preset App template |

### Coverage in ComfyField today

ComfyField's `src/lib/formats/motion.js` has 34 camera moves in three groups (Basic 12, Epic 12, Feel 10), a Mix two moves format with 12 move options, and 21 effects. Moves run on Wan 2.2 and effects on LTX Video, each from one photo plus an optional note. Cinema shot (lens and movement choices) and Transition (morph, whip pan, zoom through, match cut) cover a few more Higgsfield presets. The table compares the 134 distinct captured motion presets and the 45 Effects hub entries. Covered means a format with the same result; partial means a close format that lacks the direction, variant or subject the Higgsfield preset has.

| Higgsfield group | Covered in ComfyField | Partial | Missing |
| --- | --- | --- | --- |
| Motion, camera move (49) | 3D Rotation (Turntable), Car Grip (Car mount), Crane Down (Boom down), Crane Over The Head (Crane up), Crane Over The Head + Crash Zoom In (Mix two moves with Crane up and Crash zoom), Crane Up (Crane up), Crash Zoom In (Crash zoom), Dolly In (Dolly in), Dolly Out (Dolly out), Dolly Zoom In (Dolly zoom), Eyes In (Eyes in effect), Flying (Drone flyover), FPV Drone (FPV dive), Handheld (Handheld), Jib Down (Boom down), Jib Up (Crane up), Lazy Susan + Super Dolly Out (Mix two moves with Orbit and Dolly out), Robo Arm (Robo arm), Snorricam (Snorricam), Static (Still camera), Super Dolly In (Dolly in), Super Dolly Out (Dolly out), Through Object In (Through the window), Tilt Down (Tilt down), Tilt up (Tilt up), Whip Pan (Whip pan), Zoom In (Zoom in), Zoom Out (Zoom out) | 360 Orbit (closest: Orbit, half circle only), Arc Left (closest: Orbit, no direction choice), Arc Right (closest: Orbit, no direction choice), Car Chasing (closest: Car mount), Dolly Left (closest: Tracking shot, no direction choice), Dolly Right (closest: Tracking shot, no direction choice), Dolly Zoom Out (closest: Dolly zoom, push-in version only), Earth Zoom Out (closest: Sky pull back), Head Tracking (closest: Snorricam), Lazy Susan (closest: Orbit) | Buckle Up, Crash Zoom Out, Double Dolly, Glam, Mouth In, Object POV, Overhead, Rap Flex, Through Object Out, Wiggle, YoYo Zoom |
| Motion, camera effect (14) | Bullet Time (Bullet time), Fisheye (Cinema shot, Fisheye lens), Focus Change (Rack focus), Hyperlapse (Hyperlapse), Low Shutter (Slow shutter), Timelapse Landscape (Time lapse effect) | FPV Drone + Timelapse Landscape (closest: FPV dive and Time lapse exist, but Mix does not offer them), Lens Crack (closest: Shatter, which breaks the image rather than the lens), Lens Flare (closest: Cinema shot, anamorphic flares), Snorricam + Low Shutter (closest: Snorricam and Slow shutter exist, but Mix does not offer them) | Dirty Lens, Dutch Angle, Incline, Timelapse Human |
| Motion, transition (1) | None | Roll Transition (closest: Transition styles or 360 roll) | None |
| Motion, character action (19) | None | Downhill POV (closest: POV walk) | Action Run, Baseball Kick, Basketball Dunks, Boxing, Catwalk, Crash Zoom In + Face Punch, Face Punch, Kiss, Moonwalk Left, Moonwalk Right, Push To Glass, Skate Cruise, Skateboard Glide, Skateboard Ollie, Ski Carving, Ski Powder, Snowboard Carving, Snowboard Powder |
| Motion, VFX (49) | Disintegration (Turn to sand, Pixel dissolve), Freezing (Turn to ice), Paint Splash (Paint splash) | Garden Bloom (closest: Burst into petals), Levitation (closest: Floating fall, Balloon lift), Powder Explosion (closest: Paint splash) | Action Run + Set on Fire, Agent Reveal, Angel Wings, Black Tears, Bloom Mouth, Building Explosion, Building Explosion + Disintegration, Car Chasing + Building Explosion, Car Explosion, Clone Explosion, Crash Zoom In + Tentacles, Diamond, Duplicate, Fire Breathe, Floating Fish, Flood, Floral Eyes, Flying + Set on Fire, Glowing Fish, Glowshift, Head Explosion, Head Off, Innerlight, Invisible, Jelly Drift, Levitation + Invisible, Medusa Gorgona, Melting, Morphskin, Paparazzi, Sand Storm, Set on Fire, Skin Surge, Soul Jump, Tentacles, Thunder God, Thunder God + Levitation, Thunder God + Turning Metal, Thunder God + Wind to Face, Turning Metal, Turning Metal + Eyes In, Turning Metal + Melting, Wind to Face |
| Motion, style (1) | None | Datamosh (closest: Glitch out) | None |
| Motion, other (1) | General (Plain image to video in Create) | None | None |
| Effects hub (45) | Floating Fall (Floating fall), High Flip (High flip), Studio Slide (Studio slide), Eyes In (Eyes in), Street Colossus (Street giant), World Morphing (World morph), Bullet Time (Bullet time), Selfception (Selfception) | Comic (closest: Storyboard comic look, images only), Frozen in Motion (closest: Bullet time), Earth Zoom (closest: Sky pull back), Vanish (closest: Pixel dissolve, Turn to sand), Stop World (closest: Bullet time) | Burning Man, Scrapbook Collage, Particles, Pigeons, Pearl Earring, Incline, Act Natural, Monster Dab, Clones, Cutout, Mighty Fighter, Moonwalk, Melting, Architecture Wave, Agamemnon, Cyclope, Canvas, Tracking, LSD, Blue Depth, Wild Ride, Infinite Clones, Superstar, Skatedog, Smash and Grab, Lacewalker, Boarding Pass, Lidar Transition, Fallen Angel, Windows, Fairytale Castle, Palette |
| Mixed media (33) | None | Comic, Origami, Paper, Sketch (closest: still image looks in Storyboard, the Origami fold effect and the Explainer paper cutout style; none restyle an uploaded video) | All 33 as video-to-video looks |
| Hub-only motion names (125, not captured as pages) | Pan Left (Pan left), Pan Right (Pan right), Portal (Portal), Glitch (Glitch out), Balloon (Balloon lift) | Aerial Pullback (closest: Sky pull back), Rapid Zoom In (closest: Crash zoom), Road Rush (closest: Car mount), Sakura Petals (closest: Burst into petals), Seamless Transition (closest: Transition, morph), Flying Cam Transition (closest: Transition) | The other 114, for example Timelapse Glam, BTS, Hero Cam, Eating Zoom, Giant Grab, Money Rain, Point Cloud, Wireframe, X-ray, Werewolf and the transition family (Raven, Splash, Melt, Flame, Smoke, Hand, Hole, Jump, Display, Column Wipe) |

Totals: of 134 distinct motion presets, 38 are covered, 20 partial and 76 missing. Of 45 Effects hub entries, 8 are covered, 5 partial and 32 missing. That makes 108 captured presets with no ComfyField equivalent and 25 partial. Incline and Melting count twice, because Higgsfield runs each as a separate preset in both libraries; by unique name the figure is 106. Mixed Media (33) and the 114 uncovered hub-only names come on top.

Where the gaps cluster:

- Character actions: 18 of 19 are missing (fights, kisses, dance, ski, skate, snowboard, basketball). ComfyField has no action presets beyond High flip.
- Transformation and element VFX: 43 of 49 are missing (metal, diamond, fire, lightning, explosions, clones, creature growths).
- Direction and speed variants: Higgsfield ships Arc Left and Arc Right, Dolly Left and Dolly Right, both Dolly Zoom directions, Crash Zoom In and Out, and Super Dolly variants as separate presets, where ComfyField has one move each.
- Mix: Higgsfield's 16 pairs mix VFX with camera moves (Crash Zoom In + Tentacles). ComfyField's Mix two moves only chains its 12 camera moves.
- Video-to-video looks: nothing in ComfyField restyles an uploaded clip the way the 33 Mixed Media looks or the seven mixed-media cards in the Effects hub do.
- ComfyField formats with no captured Higgsfield twin: Tilt reveal, Spiral up, 360 roll, Earthquake shake, Snow globe, Origami fold, Hologram, Shatter, Pixel dissolve and Roller coaster (Higgsfield sells the last as a separate app).
