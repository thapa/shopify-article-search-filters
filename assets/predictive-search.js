class PredictiveSearch extends HTMLElement {
  constructor() {
    super();

    this.input = this.querySelector('input[type="search"]');
    this.predictiveSearchResults = this.closest("#ate_filter-blogs");

    this.targetblogList = this.predictiveSearchResults.querySelector(
      ".ate_filter-blog-list"
    );

    this.input.addEventListener(
      "input",
      this.debounce((event) => {
        this.onChange(event);
      }, 300).bind(this)
    );
  }

  onChange() {
    const searchTerm = this.input.value.trim();

    if (!searchTerm.length) {
      this.close();
      return;
    }

    this.getSearchResults(searchTerm);
  }

  getSearchResults(searchTerm) {
    fetch(
      `/search/suggest?q=${searchTerm}&resources[type]=article&section_id=predictive-search`
    )
      .then((response) => {
        if (!response.ok) {
          var error = new Error(response.status);
          this.close();
          throw error;
        }

        return response.text();
      })
      .then((text) => {
        const resultsMarkup = new DOMParser()
          .parseFromString(text, "text/html")
          .querySelector("#shopify-section-predictive-search");
        const blogList = resultsMarkup.querySelector(".ate_filter-blog-list");

        this.targetblogList.innerHTML = blogList.innerHTML;
        this.open();
      })
      .catch((error) => {
        if (this.input == "") {
          this.close();
        } else {
          this.targetblogList.innerText = "Nothing found.";
        }

        throw error;
      });
  }

  open() {
    // this.predictiveSearchResults.style.display = 'block';
  }

  close() {
    const url = window.location.href;

    const sectionId = this.predictiveSearchResults.dataset.sectionId;

    console.log("sectionId", sectionId);

    fetch(url + "?sections=" + sectionId)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok " + res.statusText);
        }
        return res.json();
      })
      .then((data) => {
        console.log(data);
        const sectionHTML = data[sectionId];

        console.log(sectionHTML);

        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = sectionHTML;

        const blogList = tempDiv.querySelector(".ate_filter-blog-list");
        this.targetblogList.innerHTML = blogList.innerHTML;
      })
      .catch((error) => {
        console.error("Fetch error:", error);
      });

    // this.predictiveSearchResults.style.display = 'none';
  }

  debounce(fn, wait) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }
}

customElements.define("predictive-search", PredictiveSearch);
