# YouTube viewer interaction: where stories live, how to count likes

For wayfinder ticket [#9 Launch viewer interaction](https://github.com/ecarlste/x4-swi-bounty-hunter/issues/9).
Setting: a recorded let's-play on a brand-new channel, one Premiere a week. Viewers write
wingman-pilot stories as comments, others reply with feedback, and likes pick winners and feed an
**author score**: 1 point per like on your story, plus 1 per like on each feedback reply you leave
on someone else's story.

Researched 2026-11-05. The YouTube Data API facts come from the live discovery document
(`https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest`, revision `20261104`) and the
v3 reference pages. Marked **[inferred]** where no primary source says it outright.

## Short answer

- **Put story submissions on a video, not in a Posts-tab (community) post.** The API can read
  every comment and reply on a video, with like counts, for 1 quota unit per 100 items. It has
  no way to read comments on Posts-tab posts.
- A Posts-tab post (with a poll, scheduled) still works for **announcing** a round. It just
  can't be the place a script counts.
- The script needs: `commentThreads.list?videoId=…` (top-level stories), then
  `comments.list?parentId=…` for every thread (all feedback replies), summing `likeCount` per
  `authorChannelId`. Both cost 1 unit per call. The default quota is 10,000 units/day.
- Likes are counts only. Nobody, the channel included, can see *who* liked a comment, so the
  score can't drop self-likes or sock-puppet likes.
- In X4 8.00 the player can only rename **player-owned objects** (ships, stations, fleets) and
  their own name, through the UI. NPCs can't be renamed in the UI. A mod's MD script **can**
  rename anything, NPCs included (`set_object_name`), so our extension can name wingmen and
  targets after viewers' characters.

## 1. Posts-tab (community) posts on a new channel

- **No subscriber threshold in the current help text.** The "Posts tab" availability article
  lists only these limits: supervised accounts, channels set as Made for Kids, channel role, and
  "Posts are not currently available in Germany"
  ([answer 9409631](https://support.google.com/youtube/answer/9409631)). The old 500- and
  1,000-subscriber rules (2021) are gone. Secondary sources say this happened in 2023-2024
  ([Social Media Today](https://www.socialmediatoday.com/news/youtube-expands-community-posts-to-all-users/718023/)).
- **Advanced features:** several secondary sources say Posts need advanced features. The
  primary article above doesn't say so. Advanced features need phone verification, plus channel
  history, ID verification or video verification (review usually takes about 24 h)
  ([answer 9891124](https://support.google.com/youtube/answer/9891124)). **[inferred]** Do the
  phone verification and ID verification on day one anyway: pinned comments, which we want for
  rules posts, are named there as an advanced feature.
- **Polls:** yes. Text or image polls, up to 4 options, 65 characters per text option
  (36 per image caption). Quizzes exist too
  ([answer 7124474](https://support.google.com/youtube/answer/7124474)).
- **Scheduling:** yes. Use "down arrow next to Post → Schedule Post", then pick a date, time and
  time zone ([answer 7124474](https://support.google.com/youtube/answer/7124474)).
- Poll results aren't readable through the Data API either (no resource for posts; see §2).

## 2. Reading comments through the Data API v3

`commentThreads.list` takes exactly one filter
([reference](https://developers.google.com/youtube/v3/docs/commentThreads/list); filter text
from the discovery doc):

| Filter | Covers |
|---|---|
| `videoId` | "Returns the comment threads of the specified video." |
| `allThreadsRelatedToChannelId` | "Returns the comment threads of all videos of the channel and the channel comments as well." |
| `channelId` (discovery only) | "channel comments (ie does not include comments left on videos)". Legacy: the April 30 2024 revision says the API "no longer supports the ability to insert or retrieve channel discussions" ([revision history](https://developers.google.com/youtube/v3/revision_history)). |
| `id` | specific thread IDs |

- **Posts-tab comments: not readable.** No filter and no resource covers posts. The discovery
  descriptions mention a `post_id` ("If neither video_id nor post_id is set the comments refer
  to the channel itself"; "In case of a video or post comment it's the video/post's channel"),
  but `CommentThreadSnippet` and `CommentSnippet` have no `postId` field and `list` has no post
  filter. This is a leftover of the internal schema, not a feature. A public issue asking for
  post access ([issuetracker 405004980](https://issuetracker.google.com/issues/405004980)) is
  reported closed as Infeasible. Its page needs sign-in, so I couldn't read it directly.
- **Quota:** `commentThreads.list` and `comments.list` cost **1 unit** each.
  `maxResults` can be 1-100 (default 20), and paging uses `pageToken`
  ([commentThreads.list](https://developers.google.com/youtube/v3/docs/commentThreads/list),
  [comments.list](https://developers.google.com/youtube/v3/docs/comments/list)). Reading 200
  stories with 10 replies each takes about 2 + 200 = ~202 units, far under 10,000/day.
- `order` is `time` (default) or `relevance`. `moderationStatus` (`heldForReview`,
  `likelySpam`, `published`) needs an owner-authorised (OAuth) call. Use it to find and approve
  held stories. A public API key is enough to read published comments.
- `commentThreads` returns only "a limited number of replies" in `replies.comments[]`. To get
  all of them, call `comments.list` with `parentId`
  ([commentThreads resource](https://developers.google.com/youtube/v3/docs/commentThreads)).
- Each comment gives `authorChannelId` (stable identity for the author score),
  `authorDisplayName`, `textDisplay`, `publishedAt`, `updatedAt` and `likeCount`
  ([comments resource](https://developers.google.com/youtube/v3/docs/comments)).
- `textOriginal` (raw text) "is only returned to the authenticated user if they are the
  comment's author". Request `textFormat=plainText` to get the story text without HTML.
- New since 2026-09-30: `snippet.imageUrl` for images or GIFs attached to a comment
  ([revision history](https://developers.google.com/youtube/v3/revision_history)).

## 3. Like counts

- `likeCount` is an "unsigned integer … total number of likes (positive ratings)" on every
  comment, **replies included**: replies are the same `comment` resource, fetched with
  `comments.list?parentId=` ([comments resource](https://developers.google.com/youtube/v3/docs/comments)).
- **Exact or rounded:** the docs don't say. The type is an integer, not a display string, so
  the API almost certainly returns the raw count. The "1.2K" rounding is something the web UI
  does **[inferred]**. Check this once against a real comment before launch. At our scale
  (tens of likes) it hardly matters.
- **No dislike count.** The comment resource has no dislike field, and `viewerRating` is only
  `like` or `none`: "doesn't identify `dislike` ratings"
  ([comments resource](https://developers.google.com/youtube/v3/docs/comments)). Video dislike
  counts were made private in December 2021
  ([revision history](https://developers.google.com/youtube/v3/revision_history)).
- **Who liked: not visible.** No API method lists the raters of a comment, and `viewerRating`
  only tells the *calling* user about their own rating. Studio shows the creator's own heart, not
  a list of likers **[inferred from the absence of any such field or method]**. So the rules
  can't verify likes. They have to accept that a viewer can like their own story, and that
  alt-account likes are possible.
- Counts change over time. Freeze the count at a published cut-off time: run the script then and
  commit its output to the repo.

## 4. Long comments, filtering, sorting

- **Length:** 10,000 characters per comment and per reply. This figure comes only from
  third-party sources. I found no Google page that states it
  ([Influencer Marketing Hub](https://influencermarketinghub.com/youtube-character-limits/)).
  A pilot bio fits easily. Tell viewers to keep under ~1,500 characters so a story reads in
  one "Read more" expand **[recommendation]**.
- **Held for review:** each video has a moderation level: None / Basic (default-like) / Strict /
  Hold all. On top of that, the channel can block words and "hold comments that contain URLs
  for review". Held comments stay in Studio's "Held" tab for up to 60 days
  ([answer 9483359](https://support.google.com/youtube/answer/9483359)). Separately, YouTube's
  spam filter can send comments to "Likely spam", and long or link-heavy comments are typical
  victims **[inferred]**. The script should list `heldForReview` and `likelySpam` (OAuth) so we
  can approve real stories. The rules should say **no links in stories**.
- **Top-comments sorting:** the UI's default "Top comments" order is a relevance ranking, not
  pure likes. Newer or low-engagement stories get buried, which feeds a rich-get-richer effect
  **[inferred; YouTube doesn't publish the ranking]**. Fixes: pin a rules comment, heart new
  entries, and on-screen read out a "newest entries" list each week. The API's `order=time`
  lets the script see every story whatever the UI order.

## 5. Premiere chat

- Yes. A Premiere has live chat, and viewers can chat on the watch page before it starts
  ([answer 9080341](https://support.google.com/youtube/answer/9080341)).
- **Saved and replayable:** "Chat replay is available for viewers who want to experience the
  Premiere chat after it has ended" (same page). The countdown isn't part of the saved video.
- The Data API's `liveChatMessages` covers live broadcasts. Whether it can read a Premiere's chat
  wasn't checked **[open]**. In any case, chat is a poor home for stories: messages are short
  and ephemeral, and they carry no likes. Use the chat for live hype only.

## 6. Alternatives if YouTube comments fall short

- **Discord forum channel:** one post per story, and reactions as votes. The message object
  carries `reactions[]` with a `count` per emoji, and
  `GET /channels/{channel.id}/messages/{message.id}/reactions/{emoji}` **lists the users** who
  reacted. That makes self-votes and duplicate voters filterable, which YouTube can't do
  ([Discord API: Message](https://discord.com/developers/docs/resources/message)). Needs a bot
  token. Joining a server is friction for casual viewers.
- **GitHub Discussions:** GraphQL `Discussion.upvoteCount`, plus `reactionGroups { content
  reactors { totalCount } }` on discussions and comments, with reactor identities
  ([GitHub GraphQL objects](https://docs.github.com/en/graphql/reference/objects#discussion)).
  Needs a GitHub account, which most YouTube viewers don't have.
- Both are fine as a backup or an archive. YouTube comments keep the engagement on the video,
  where it helps the algorithm, so they stay the first choice.

## 7. X4 8.00: renaming NPCs and targets

Source: unpacked vanilla 8.00 (`/mnt/e/x4-dev/reference/x4-8.00/base`).

- **UI rename is for player-owned objects only.** `menu_map.lua` shows the Name field as an edit
  box only `if isplayerowned`, in the info submenu modes `ship`, `station`, `sector`, `gate` and
  `deployable` (lines ~13141-14283). The edit box calls `menu.infoChangeObjectName` →
  `SetComponentName` (line 27711). The interact-menu "Rename" / "Rename fleet" actions
  (`menu_interactmenu.lua:5227, 5703`) open the map's `renamecontext` → `SetComponentName` or
  `C.SetFleetName` (`menu_map.lua:23923`).
- **No UI path renames a person.** The crew info submenu (`setupCrewInfoSubmenuRows`,
  `menu_map.lua:14378`) only displays names. Apart from `SetComponentName`, the UI's only name
  setters are `SetFleetName`, `SetPlayerFactionName` and `SetCustomGameStartPlayerPropertyName`.
  The player's own name is editable in `menu_playerinfo.lua:1039`.
  **[inferred]** The interact menu's action list comes from the engine, and no NPC rename action
  appears in it.
- **Bounty targets** are NPC-owned, so the player can't rename their ships or pilots in game.
- **A mod can rename anything.** MD `set_object_name object="…" name="…"` sets "an object's
  name" (`libraries/common.xsd:33741`), and vanilla itself uses it on an NPC
  (`md/setup_gamestarts.xml:1784`, `set_object_name object="$NPC"`). `clear_object_name` undoes
  it. So our extension can give a wingman pilot, or a target ship and its pilot, a viewer's
  character name from a table in our MD. That's a design choice, and the player never renames
  anything by hand. Note that text set with `name=` is stored literally in the save and isn't
  localised.

## Open questions

- Is the exact `likeCount` the same as what the UI shows? Check against one real comment.
- Does a new channel get the Posts tab immediately, or only after advanced features? Check in
  Studio on the real channel.
- Can `liveChatMessages` read a Premiere's chat (only matters if chat is ever used for voting)?
