(function () {
  "use strict";

  var root = document.querySelector("[data-writing-index]");
  if (!root) {
    return;
  }

  var list = root.querySelector("[data-article-list]");
  var cards = Array.prototype.slice.call(root.querySelectorAll("[data-article]"));
  var searchInput = root.querySelector("[data-article-search]");
  var sortSelect = root.querySelector("[data-article-sort]");
  var resultCount = root.querySelector("[data-result-count]");
  var emptyState = root.querySelector("[data-empty-state]");
  var topicFilters = root.querySelector("[data-topic-filters]");
  var periodFilters = root.querySelector("[data-period-filters]");
  var filterToggle = root.querySelector("[data-filter-toggle]");
  var filterToggleCount = root.querySelector("[data-filter-toggle-count]");
  var validSorts = ["newest", "oldest", "title", "shortest"];

  if (!list || !cards.length || !searchInput || !sortSelect || !resultCount || !emptyState ||
      !topicFilters || !periodFilters || !filterToggle || !filterToggleCount) {
    return;
  }

  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase()
      .trim();
  }

  function tokens(value) {
    return new Set(String(value || "").split(/\s+/).filter(Boolean));
  }

  var labels = {
    topic: new Map(),
    period: new Map()
  };

  cards.forEach(function (card) {
    card.querySelectorAll("[data-card-filter]").forEach(function (tag) {
      labels[tag.dataset.cardFilter].set(tag.dataset.filterValue, tag.textContent.trim());
    });
  });

  var articles = cards.map(function (card, originalIndex) {
    return {
      card: card,
      originalIndex: originalIndex,
      published: card.dataset.published,
      readMinutes: Number(card.dataset.readMinutes),
      title: normalize(card.dataset.title),
      searchText: normalize(card.textContent),
      topics: tokens(card.dataset.topics),
      periods: tokens(card.dataset.periods)
    };
  });

  var state = {
    query: "",
    sort: "newest",
    topics: new Set(),
    periods: new Set()
  };

  function articleHasAny(articleValues, selectedValues) {
    if (!selectedValues.size) {
      return true;
    }

    return Array.from(selectedValues).some(function (value) {
      return articleValues.has(value);
    });
  }

  function articleMatches(article, omittedFacet) {
    var query = normalize(state.query);

    if (query && !article.searchText.includes(query)) {
      return false;
    }

    if (omittedFacet !== "topic" && !articleHasAny(article.topics, state.topics)) {
      return false;
    }

    if (omittedFacet !== "period" && !articleHasAny(article.periods, state.periods)) {
      return false;
    }

    return true;
  }

  function createFacetOptions(container, facet, labelMap) {
    var values = Array.from(labelMap.entries()).sort(function (left, right) {
      return left[1].localeCompare(right[1], "en", { sensitivity: "base" });
    });

    values.forEach(function (entry) {
      var value = entry[0];
      var text = entry[1];
      var label = document.createElement("label");
      var input = document.createElement("input");
      var name = document.createElement("span");
      var count = document.createElement("span");

      label.className = "writing-facet-option";
      input.type = "checkbox";
      input.value = value;
      input.dataset.facet = facet;
      input.setAttribute("aria-label", text);
      name.className = "writing-facet-name";
      name.textContent = text;
      count.className = "writing-facet-count";
      count.dataset.facetCount = "";
      count.setAttribute("aria-hidden", "true");

      label.appendChild(input);
      label.appendChild(name);
      label.appendChild(count);
      container.appendChild(label);
    });
  }

  createFacetOptions(topicFilters, "topic", labels.topic);
  createFacetOptions(periodFilters, "period", labels.period);

  function readStateFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var requestedSort = params.get("sort");

    state.query = params.get("q") || "";
    state.sort = validSorts.includes(requestedSort) ? requestedSort : "newest";
    state.topics.clear();
    state.periods.clear();

    params.getAll("topic").forEach(function (value) {
      if (labels.topic.has(value)) {
        state.topics.add(value);
      }
    });

    params.getAll("period").forEach(function (value) {
      if (labels.period.has(value)) {
        state.periods.add(value);
      }
    });

    searchInput.value = state.query;
    sortSelect.value = state.sort;
  }

  function writeStateToUrl() {
    var params = new URLSearchParams();

    if (state.query.trim()) {
      params.set("q", state.query.trim());
    }

    Array.from(state.topics).sort().forEach(function (value) {
      params.append("topic", value);
    });

    Array.from(state.periods).sort().forEach(function (value) {
      params.append("period", value);
    });

    if (state.sort !== "newest") {
      params.set("sort", state.sort);
    }

    var queryString = params.toString();
    var nextUrl = window.location.pathname + (queryString ? "?" + queryString : "") + window.location.hash;
    window.history.replaceState(null, "", nextUrl);
  }

  function sortedArticles() {
    return articles.slice().sort(function (left, right) {
      if (state.sort === "oldest") {
        return left.published.localeCompare(right.published) || left.originalIndex - right.originalIndex;
      }

      if (state.sort === "title") {
        return left.title.localeCompare(right.title, "en", { sensitivity: "base" });
      }

      if (state.sort === "shortest") {
        return left.readMinutes - right.readMinutes || right.published.localeCompare(left.published);
      }

      return right.published.localeCompare(left.published) || left.originalIndex - right.originalIndex;
    });
  }

  function updateFacetCounts(facet) {
    var selector = "input[data-facet=\"" + facet + "\"]";
    var articleProperty = facet === "topic" ? "topics" : "periods";
    var selectedValues = facet === "topic" ? state.topics : state.periods;

    root.querySelectorAll(selector).forEach(function (input) {
      var count = articles.filter(function (article) {
        return articleMatches(article, facet) && article[articleProperty].has(input.value);
      }).length;
      var option = input.closest(".writing-facet-option");
      var countElement = option.querySelector("[data-facet-count]");

      input.checked = selectedValues.has(input.value);
      input.disabled = count === 0 && !input.checked;
      option.classList.toggle("is-unavailable", input.disabled);
      countElement.textContent = count;
    });
  }

  function updateTagButtons() {
    root.querySelectorAll("[data-card-filter]").forEach(function (tag) {
      var selectedValues = tag.dataset.cardFilter === "topic" ? state.topics : state.periods;
      tag.disabled = false;
      tag.setAttribute("aria-pressed", selectedValues.has(tag.dataset.filterValue) ? "true" : "false");
    });
  }

  function updateControls(visibleCount) {
    var facetCount = state.topics.size + state.periods.size;
    var hasChanges = Boolean(state.query.trim()) || facetCount > 0 || state.sort !== "newest";

    resultCount.textContent = visibleCount + (visibleCount === 1 ? " article" : " articles");
    root.querySelectorAll("[data-clear-index]").forEach(function (button) {
      button.hidden = !hasChanges;
    });

    filterToggleCount.textContent = facetCount + " selected";
    filterToggleCount.hidden = facetCount === 0;

    updateFacetCounts("topic");
    updateFacetCounts("period");
    updateTagButtons();
  }

  function applyState(updateUrl) {
    var ordered = sortedArticles();
    var fragment = document.createDocumentFragment();
    var visibleCount = 0;

    ordered.forEach(function (article) {
      var visible = articleMatches(article);
      article.card.hidden = !visible;
      if (visible) {
        visibleCount += 1;
      }
      fragment.appendChild(article.card);
    });

    list.appendChild(fragment);
    list.hidden = visibleCount === 0;
    emptyState.hidden = visibleCount !== 0;
    updateControls(visibleCount);

    if (updateUrl !== false) {
      writeStateToUrl();
    }
  }

  function clearIndex() {
    state.query = "";
    state.sort = "newest";
    state.topics.clear();
    state.periods.clear();
    searchInput.value = "";
    sortSelect.value = "newest";
    applyState();
    searchInput.focus();
  }

  root.addEventListener("change", function (event) {
    var input = event.target;

    if (input.matches("[data-article-sort]")) {
      state.sort = input.value;
      applyState();
      return;
    }

    if (input.matches("input[data-facet]")) {
      var selectedValues = input.dataset.facet === "topic" ? state.topics : state.periods;

      if (input.checked) {
        selectedValues.add(input.value);
      } else {
        selectedValues.delete(input.value);
      }

      applyState();
    }
  });

  searchInput.addEventListener("input", function () {
    state.query = searchInput.value;
    applyState();
  });

  root.addEventListener("click", function (event) {
    var clearButton = event.target.closest("[data-clear-index]");
    var tag = event.target.closest("[data-card-filter]");
    var toggle = event.target.closest("[data-filter-toggle]");

    if (clearButton) {
      clearIndex();
      return;
    }

    if (tag) {
      var selectedValues = tag.dataset.cardFilter === "topic" ? state.topics : state.periods;
      var value = tag.dataset.filterValue;

      if (selectedValues.has(value)) {
        selectedValues.delete(value);
      } else {
        selectedValues.add(value);
      }

      applyState();
      return;
    }

    if (toggle) {
      toggle.setAttribute("aria-expanded", toggle.getAttribute("aria-expanded") === "true" ? "false" : "true");
    }
  });

  window.addEventListener("popstate", function () {
    readStateFromUrl();
    applyState(false);
  });

  readStateFromUrl();
  if (state.topics.size || state.periods.size) {
    filterToggle.setAttribute("aria-expanded", "true");
  }
  root.classList.add("is-ready");
  applyState(false);
}());
