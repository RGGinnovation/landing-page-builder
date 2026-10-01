# Capturing the partner's voice, and staying compliant

## Voice capture

The copy only works if the partner's audience hears the partner. Before writing a word:

1. Collect 5 to 10 verbatim samples of how the partner talks or writes, in this priority:
   - Show or ministry "About" and host bio (their own words, not a third party's).
   - Episode titles and descriptions, YouTube channel description, Substack or blog intros.
   - Their social posts (X, Facebook, Instagram captions).
   - HubSpot call notes that quote them directly.

   Leave out anything RGG wrote for them (notes like "we supplied blog posts for his Substack",
   ghost-written columns, our decks). That is our voice, not theirs.
2. From the samples, write a 5-line voice profile and keep it in the output:
   - Signature phrases or nicknames (e.g. Mike Church: "King Dude").
   - Sentence length and rhythm (punchy and blunt, or warm and pastoral).
   - Worldview anchors they return to (Constitution, Scripture, self-reliance, family).
   - Words they would never use.
   - Formality level.
3. Write every field in that voice. Borrow their vocabulary and framing, not their exact
   sentences, unless a line is clearly theirs and on-topic.

Read the finished copy aloud as the partner. If it sounds like a bank, rewrite it.

## Compliance: every field is public, partner-facing copy

### Rule 1: opinion and belief only (the rule reviewers check first)

The quote, Why I Believe, 3 Reasons and every other partner line are the partner's personal
opinion and belief. No sentence says what gold and silver do for anyone.

- Frame every metals statement as a belief: "I believe", "to me", "I'd rather own something
  real", "I like things I can hold".
- Never state or imply a benefit or outcome, not even hedged. Banned in partner copy: protect,
  preserve, safeguard, shield, hedge, safe, secure, grow or growth, gains, returns, profit,
  appreciate, "worth more", "worth over time", "hold their value", "store of value",
  "beat inflation", "carried families through hard times", and any "may help ..." or
  "can help ..." about metals. "May help protect" and "can help diversify" are NOT compliant.
- Never tell the reader what to do with their money: no "you should", "diversify your",
  "move your 401(k)". The reader is invited to request a free guide, nothing else.
- Facts are context for a belief, never a promise: "The national debt has passed $40 trillion,
  and I don't see a plan to pay it down" is fine. Linking a fact to what metals will do is not.

### Rule 2: never put words or actions in their mouth

A belief can be drafted for the partner to approve. An action or experience cannot be invented.

- **Allowed without a source:** beliefs consistent with their public worldview ("I believe in
  owning something real"), and the partnership itself ("That's why I partnered with
  **Revelation Gold Group**"), which is always true.
- **Allowed only as a confirmed `experience` claim:** anything they did, own or experienced.
  Owning or buying metals, how long, their family's choices, their savings or IRA, choosing or
  vetting RGG, meeting the team, asking questions, how they were treated. The source must be
  the partner: their own public words (post, interview, show) or a HubSpot note recording what
  they told us. Put the exact phrase from the copy in the claim (`phrase`), so the script can
  check it.
- **Never:** made-up vetting stories ("I did my homework", "I met the team", "I asked every
  question", "nobody pushed me"), invented family details, invented numbers or years, quotes
  presented as things they said.

`scripts/build.py` finds every first person action ("I bought", "I chose", "I keep", "my
family's savings", "nobody pushed me") and stops with an ERROR unless a confirmed experience
claim covers it.

### Rule 3: words that never appear in partner copy

- **support** in any form (support, supports, supported, supporting, supporter).
- **recommend** in any form: a recommendation is advice.
- **invest**, investment, investor: reads as investment advice. Approved phrasing: "a
  tax-advantaged gold IRA".
- **sponsor**: the partner is a referral partner, not a sponsor.
- Superlatives: best, top-rated, leading, number one, #1, most trusted, most honest.
- Unverified counts and reach: thousands of, millions of, all over the country, nationwide,
  across America.
- Hype, pressure or fear: proven, always, act now, don't wait, before it's too late, limited
  time, "the crash is coming", "when the dollar collapses".

Rewrite examples:

| Not compliant | Compliant |
| --- | --- |
| Physical gold and silver can help diversify what my family's savings are worth over time. | I believe in owning something real, not just paper. |
| A faith-driven firm that shows families how physical gold and silver may help protect retirement and savings. | That's why I partnered with **Revelation Gold Group**, a faith-driven firm. |
| I did my homework, met the team and asked every question. Nobody pushed me. (invented) | That's why I partnered with **Revelation Gold Group**. |
| Owning physical gold is a personal choice I made for my family. (no source says so) | To me, gold and silver are part of being good stewards. |
| I proudly support Revelation Gold Group and recommend them to every listener. | That's why I partnered with **Revelation Gold Group**. Start with their free guide. |
| They have helped thousands of families all over the country. | A **BBB Accredited Business with an A+ rating**. |
| Gold and silver have carried families through hard seasons for generations. | For us, gold and silver are part of being good stewards. (faith partners only) |
| Moved directly from one custodian to another, the funds stay tax deferred. No taxes. | Ask how a direct custodian-to-custodian transfer works before you decide anything. |

Confirmed experience, kept as is: Pete Kaliner, "I've bought silver since the 2008 crash"
(HubSpot note, 2026-09-08, his own account).

The build script runs the app's rule list (`assets/rules.json`, generated from
`src/template/compliance.ts`) plus Rules 2 and 3. Any hit is an ERROR.

### Truth and faith

- Every fact about the partner in the copy is in `claims` with a source (a web URL, or a
  HubSpot note and its date). Never invent a biography detail, a number or a quote. If it is
  not sourced, it is not in the copy.
- Let faith come from them. Use faith language (God, Scripture, steward, blessed, church),
  "faith-driven firm" or the Faithful Steward guide only when the partner's own public frame
  is faith, and set `partner.faithForward` accordingly. For a freedom-first host, write in
  freedom-first terms.
- Use their real titles and organization names, checked against the official source. If
  HubSpot and the website disagree, flag it for review. Do not pick one silently.
- Get the setting right. If the partner covers a team, a region or a denomination, name it
  correctly (Liberty University Flames, not the Calgary Flames).
- Company facts about Revelation Gold Group are limited to the approved list below. Nothing
  else about RGG goes in partner copy.

### Everything else

- No guarantees, "risk-free", "safe haven" or price predictions.
- No tax or investment advice. Approved phrasing: "a tax-advantaged gold IRA".
- No claims about competitors.
- Statistics carry a named source and date, and are verified now. Unverifiable: drop the number.
- Endorsements: every first person line is a draft for the partner to approve (FTC endorsement
  rules: the partner must genuinely hold the opinion, and any experience must be true). Mark
  them "DRAFT FOR PARTNER APPROVAL". Never present invented lines as things the partner has said.
- The footer already carries "Not financial advice" and the one-paragraph disclaimer. Do not add
  disclaimers inside the fields.

## RGG house style

- Never use em dashes or en dashes. Use a period, comma or colon.
- Plain, warm American English. No hype, no exclamation marks in page copy.
- Approved company facts, the only RGG facts allowed in partner copy:
  - BBB Accredited Business with an A+ rating (accredited since March 22, 2024).
  - 4.9 star Google rating across 256 reviews. Perishable: the kit adds "verify before launch".
  - Verified reviews on Trustpilot.
  - Revelation Gold Group, 9440 Santa Monica Blvd, Suite 301, Beverly Hills, CA 90210,
    (888) 465-3049.
  - Faith-driven precious metals firm (faith partners only): physical gold and silver,
    a tax-advantaged gold IRA, buyback.
  - The guide is free, with nothing to buy.
