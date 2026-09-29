"""Builds index-single-file.html (the whole site in one file) from index.html, assets/ and
thank-you/index.html. Run from this folder: python3 build-single.py"""
import base64, re

def uri(p, mime):
    return "data:%s;base64,%s" % (mime, base64.b64encode(open(p, "rb").read()).decode())

idx = open("index.html").read()
ty = open("thank-you/index.html").read()
css = open("assets/site.css").read()
js = open("assets/lead-form.js").read().replace('THANK_YOU_URL: "/thank-you/"', 'THANK_YOU_URL: "#thank-you"')
assert "#thank-you" in js
imgs = {
    "/assets/rgg-logo.png": uri("assets/rgg-logo.png", "image/png"),
    "/assets/rgg-logo-footer.png": uri("assets/rgg-logo-footer.png", "image/png"),
    "/assets/crosses-banner.webp": uri("assets/crosses-banner.webp", "image/webp"),
    "/assets/faithful-steward-cover.webp": uri("assets/faithful-steward-cover.webp", "image/webp"),
    "/assets/faithful-steward-kit.webp": uri("assets/faithful-steward-kit.webp", "image/webp"),
}
tyblock = ty[ty.index("<!-- thank you -->"):ty.index("<!-- 11 footer -->")]
tyblock = tyblock.replace('<div class="ty">', '<div class="ty" id="tyView" hidden>', 1)

router = """<script>
(function () {
  var landing = document.getElementById("landing"), ty = document.getElementById("tyView");
  function route() {
    var on = window.location.hash === "#thank-you";
    landing.hidden = on; ty.hidden = !on;
    if (on) {
      document.title = "Your guide is on its way | Revelation Gold Group";
      try {
        var n = (sessionStorage.getItem("rggLead") || "").trim();
        if (n && n.toLowerCase() !== "undefined") document.getElementById("tyTitle").textContent = n + ", your guide is on its way";
      } catch (e) {}
      window.scrollTo(0, 0);
    }
  }
  window.addEventListener("hashchange", route);
  route();
})();
</script>
"""

out = idx
out = out.replace('<link rel="stylesheet" href="/assets/site.css">', "<style>\n" + css + "\n[hidden]{display:none!important;}\n</style>")
out = out.replace("<!-- 3 heading, then the form -->", '<main id="landing">\n<!-- 3 heading, then the form -->')
out = out.replace("<!-- 11 footer -->", "</main>\n\n" + tyblock + "<!-- 11 footer -->")
out = out.replace('<script src="/assets/lead-form.js"></script>', "<script>\n" + js + "\n</script>\n" + router)
out = re.sub(r'<meta property="og:image" content="[^"]*">\n', "", out)
for k, v in imgs.items():
    out = out.replace(k, v)
assert "/assets/" not in out, re.findall(r"/assets/[^\"' )]*", out)
open("index-single-file.html", "w").write(out)
print("index-single-file.html", len(out) // 1024, "KB")
