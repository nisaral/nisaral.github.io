(function () {
  var PAGE = "https://nisaral.github.io";
  var UNIQUE = "https://nisaral.github.io/unique-visitors";
  var isStats = /stats\.html$/.test(location.pathname);

  function hitUrl(key) {
    return "https://hitscounter.dev/api/hit?url=" + encodeURIComponent(key) + "&output=json";
  }

  function load(key) {
    return fetch(hitUrl(key), { cache: "no-store" }).then(function (r) { return r.json(); });
  }

  function fmt(n) {
    return Number(n || 0).toLocaleString();
  }

  function paintFooter(opens) {
    var el = document.getElementById("hit-label");
    if (el && opens) el.textContent = fmt(opens.total_hits) + " opens";
  }

  function recordGeo() {
    return fetch("https://get.geojs.io/v1/ip/geo.json")
      .then(function (r) { return r.json(); })
      .then(function (g) {
        var row = {
          t: new Date().toISOString(),
          city: g.city || "",
          region: g.region || "",
          country: g.country || "",
          ref: document.referrer || "direct",
          path: location.pathname || "/",
          device: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop"
        };
        localStorage.setItem("kn_last", JSON.stringify(row));
        return row;
      })
      .catch(function () { return null; });
  }

  function run() {
    var tasks = [];

    if (!isStats) {
      tasks.push(
        load(PAGE).then(function (opens) {
          localStorage.setItem("kn_opens", JSON.stringify(opens));
          paintFooter(opens);
          return opens;
        })
      );
      if (!localStorage.getItem("kn_uid")) {
        localStorage.setItem("kn_uid", (crypto.randomUUID && crypto.randomUUID()) || String(Date.now()));
        tasks.push(
          load(UNIQUE).then(function (u) {
            localStorage.setItem("kn_uniques", JSON.stringify(u));
            return u;
          })
        );
      }
      tasks.push(recordGeo());
    } else {
      var cached = localStorage.getItem("kn_opens");
      if (cached) paintFooter(JSON.parse(cached));
    }

    Promise.all(tasks).catch(function () {});
  }

  run();
})();
