document.addEventListener("DOMContentLoaded", function () {
  // Use buttons to toggle between views
  /*  document
    .querySelector("#post-form-submit")
    .addEventListener("click", upd_post); // event to open inbox mailbox
*/
  // hide some divs
  document.querySelector("#error-message").style.display = "none";
});

// hide all div pages but displays only the one requested.
// Input :
//    div_page_id : Tag id of the div element to be displayed (page to be displayed).
//
function display_page(div_page_id) {
  // Hide all pages
  document.querySelector("#product-list").style.display = "none";
  document.querySelector("#product-item").style.display = "none";
  document.querySelector("#product-update").style.display = "none";

  // display the page requested.
  const tag_id = "#" + div_page_id;
  document.querySelector(tag_id).style.display = "block";

  return true;
}

//
// Function to render the navigation page bar
// Parameter : dict - page dictionary to get information in each page we are and total count.
//             filter - must apply the filter, in case exists.
//
function render_navigation(filter, dict) {
  // initialize temp variables
  let previous = "";
  let next = "";

  // check if previous button is required.
  if (dict["previous"] != -1) {
    previous = `<input type="button" class="btn btn-outline-secondary btn-sm btn-block" onclick="product_catalog_page('${filter}', ${dict["previous"]})" value="Previous">`;
  }

  // check if next button is required.
  if (dict["next"] != -1) {
    next = `<input type="button" class="btn btn-outline-secondary btn-sm btn-block" onclick="product_catalog_page('${filter}', ${dict["next"]})" value="Next">`;
  }

  // render all elements.
  let nav_pagination = `
  <div class="box">
    <div>
      <div class="row">
        <div class="col-2">${previous}</div>
        <div class="col-1"></div>
        <div class="col-2">${next}</div>
        <div class="col-7"></div>
      </div>
  </div>`;

  return nav_pagination;
}

//
// Function to display or hide the filter on the product page.
//
function btn_product_display_filter() {
  // Hide all pages
  if (
    document.querySelector("#btn-product-display-filter").value ===
    "Show filter"
  ) {
    document.querySelector("#btn-product-display-filter").value = "Hide filter";
    document.querySelector("#div-product-filter").style.display = "block";
  } else {
    document.querySelector("#btn-product-display-filter").value = "Show filter";
    document.querySelector("#div-product-filter").style.display = "none";
  }

  return false;
}

//
// Function to apply the filter.
//
function btn_product_filter() {
  filter = document.querySelector("#input-product-filter").value;
  filter.trim();
  if (filter === "") {
    alert("Please enter the filter.");
  } else {
    product_catalog_page(filter, 0);
  }
  return false;
}

//
// Function to render the page for one product.
//
// Parameter :
//    dict - page dictionary to get information in each page we are and total count.
//
//
function render_product_edit(response) {
  // initialize temp variables
  const {
    id,
    code,
    name,
    description,
    category_id,
    category,
    model_id,
    model,
    imagem,
    //stocks,
    owner,
    change,
    creation_date,
  } = response["products"]; // object deconstruction.

  document.getElementById("product-form").reset();
  document.getElementById("product-edit-title").innerHTML =
    "<h2>Edit Product</h2>";

  // Product Content
  document.querySelector("#productId").value = id;
  document.querySelector("#productCode").value = code;
  document.querySelector("#productName").value = name;
  document.querySelector("#productCategory").value = category_id;
  document.querySelector("#productModel").value = model_id;
  document.querySelector("#productDescription").value = description;

  // Display buttons for edit and hide the other to add product page
  document.querySelector("#div-btn-product-save").style.display = "none";
  document.querySelector("#div-btn-product-saveexit").style.display = "none";
  document.querySelector("#div-btn-product-edit").style.display = "block";

  // Update the contend and call function to display only the page requested.
  display_page("product-update");
}

//
// Function to display the edit product page.
//
function edit_product_page(product_code) {
  fetch_url = `/product/get/${product_code}`;

  fetch(fetch_url, {
    method: "GET",
  })
    .then(function (response) {
      if (response.status >= 200 && response.status < 300) {
        // Post message successfully
        // hide div with used to display error message
        document.querySelector("#error-message").innerHTML = "";
        document.querySelector("#error-message").style.display = "none";
        return response.json();
      } else {
        // Error was returned. Extract error content.
        response.json().then(function (data) {
          // Display error message.
          document.querySelector("#error-message").innerHTML = data.error;
          document.querySelector("#error-message").style.display = "block";
          window.scrollTo(0, 0);
          return false;
        });
      }
    })
    .then((response) => {
      render_product_edit(response);
    });

  event.preventDefault();
}

//
// Function to display the add product page.
//
function add_product_page() {
  // Clear form fields.
  document.getElementById("product-form").reset();

  // Change page title
  document.getElementById("product-edit-title").innerHTML =
    "<h2>Add Product</h2>";

  // ProductId must be zero for consistency but not used. Just used on Edit Product Page.
  document.querySelector("#productId").value = "0";

  // Display buttons for add product and hide the others to edit product
  document.querySelector("#div-btn-product-save").style.display = "block";
  document.querySelector("#div-btn-product-saveexit").style.display = "block";
  document.querySelector("#div-btn-product-edit").style.display = "none";

  display_page("product-update");
  event.preventDefault();
}

//
// Function to display the message Future Release.
//
function btn_future_release() {
  window.alert(`To be implemented in the next release.`);
  event.preventDefault();
}

//
// Function to delete product.
//
function btn_product_delete(product) {
  window.alert(
    `Sorry, ${product} ! Not able to implement delete function. I have to focus on mobile-responsive.`
  );
  event.preventDefault();
}

//
// Function to edit the product, read values from the from, after invoke the API to edit the product.
//
function btn_product_edit() {
  const product = {
    id: document.getElementById("productId").value,
    code: document.getElementById("productCode").value.toUpperCase(),
    name: document.getElementById("productName").value,
    category: document.getElementById("productCategory").value,
    model: document.getElementById("productModel").value,
    description: document.getElementById("productDescription").value,
  };

  response = upd_product(product, "view");
}

//
// Function to save the product, read values from the form, after call the API to save the product.
// input :
//
//    action : Action defined which page should be opened, after the product is saved or updated
//          "continue" - save and continue to add a new product
//          "exit" - save and return to the product caalog page
//           "edit" - returns to the produc page.
//
function btn_product_save(action) {
  const product = {
    id: 0, // 0 means add new product
    code: document.getElementById("productCode").value.toUpperCase(),
    name: document.getElementById("productName").value,
    category: document.getElementById("productCategory").value,
    model: document.getElementById("productModel").value,
    description: document.getElementById("productDescription").value,
  };

  response = upd_product(product, action);
}

//
//  Function Responsible add a new product or update an existing one.
//  Input:
//      product = dictionary keeps all product data. Id=0 means add the product, otherwise edit an existing one.
//      action : Action defines which page should be opened, after the product is saved or updated
//               "continue" - save and continue to add a new product
//               "exit" - save and return to the product caalog page.
//                "edit" - returns to the produc page.
//
function upd_product(product, action) {
  // check if its add or update
  if (product.id == 0) {
    // Add
    fetch_url = "/product/add/";
    method = "POST";
    product = product;
  } else {
    // product exists, so update
    fetch_url = "/product/update/";
    method = "PUT";
    product = product;
  }

  fetch(fetch_url, {
    method: method,
    body: JSON.stringify({
      product: product,
    }),
  }).then(function (response) {
    if (response.status >= 200 && response.status < 300) {
      // add or updated successfully
      // hide div with used to display error message
      document.querySelector("#error-message").innerHTML = "";
      document.querySelector("#error-message").style.display = "none";

      if (action == "exit") {
        // Save and Exit. returns to the product catalog page
        product_catalog_page("", 0);
      } else if (action == "continue") {
        // Save and continue. Opens a new add form
        add_product_page();
      } else {
        // Edit. Opens the product page
        product_page(product.code);
      }
      return true;
    } else {
      // Error was returned. Extract error content.
      response.json().then(function (data) {
        // Display error message.
        document.querySelector("#error-message").innerHTML = data.error;
        document.querySelector("#error-message").style.display = "block";
        window.scrollTo(0, 0);
        return false;
      });
    }
  });

  event.preventDefault();
}

//
// Function to render the page for one product.
//
// Parameter :
//    dict - page dictionary to get information in each page we are and total count.
//
//
function render_product(response) {
  // initialize temp variables
  let grid_lines = "";

  const {
    id,
    code,
    name,
    description,
    category,
    model,
    imagem,
    //stocks,
    owner,
    change,
    creation_date,
  } = response["products"]; // object deconstruction.

  // Display edit button according user's profile and item status.
  let btn_edit = "";
  let btn_del = "";
  let owner_label = "No";
  if (owner) {
    // User is the product owner for the line or admin user,
    // so edit or approve change button must be displayed.
    owner_label = "Yes";
    btn_edit = `<a onclick="edit_product_page('${code}')"><button type="button" class="btn btn-warning">Edit</button></a>`;
    btn_del = `<a onclick="btn_product_delete('${code}')"><button type="button" class="btn btn-danger">Delete</button></a>`;
  }

  // Product Content # PAREI AQUI
  const product_content = `
    <div class="row">
      <div class="col-sm-2 bg-info" style="background-color:white;text-align:left;"><h3>${code}</h3></div>
      <div class="col-sm-10 bg-info" style="background-color:white; text-align:left;"><h3>${name}</h3></div>
    </div>
    <div class="row">
      <div class="col-sm-2" style="background-color:white;"><h5>Category :</h5></div>
      <div class="col-sm-10" style="background-color:white;"><h5>${category}</h5></div>
    </div>
    <div class="row">      
      <div class="col-sm-2" style="background-color:white;"><h5>Model : </h5></div>
      <div class="col-sm-10" style="background-color:white;"><h5>${model}</h5></div>
    </div>
    <div class="row">
      <div class="col-sm-2" style="background-color:white;"><h5>Description : </h5></div>
      <div class="col-sm-10" style="background-color:white;"><h5>${description}</h5></div>
    </div>
    <div class="row">
      <div class="col-sm-2" style="background-color:white;"><h5>Owner : </h5></div>
      <div class="col-sm-10" style="background-color:white;"><h5>${owner_label}</h5></div>
    </div>
    <div class="row">
      <div class="col-sm-2" style="background-color:white;"><h5>Creation Date : </h5></div>
      <div class="col-sm-10" style="background-color:white;"><h5>${creation_date}</h5></div>
    </div>
    <div class="row">
      <div class="col-sm-2" style="background-color:white;"><h5></h5></div>
      <div class="col-sm-10" style="background-color:white;"><h5></h5></div>
    </div>
    <div class="row">
      <div class="col-sm-1" style="background-color:white;"><a onclick="display_page('product-list')"><button type="button" class="btn btn-primary">Back</button></a></div>
      <div class="col-sm-1" style="background-color:white;">${btn_edit}</div>
      <div class="col-sm-1" style="background-color:white;">${btn_del}</div>
      <div class="col-sm-9" style="background-color:white;"></div>
    </div>`;

  const html = product_content;

  // Update the contend and call function to display only the page requested.
  document.querySelector("#product-item").innerHTML = html;
  display_page("product-item");

  return true;
}
/*
//
// Function responsible to invoke the API to return the product json.
//
// Input:
//       product_code - id of the product to be retrieved.
//
// Return : product in json format
//
function product_api(product_code) {
  fetch_url = `/product/get/${product_code}`;

  fetch(fetch_url, {
    method: "GET",
  }).then(function (response) {
    console.log(response);
    return response;
  });
}
*/

//
// Function responsible to retrieve a product and call render the product page.
//
// Input:
//       product_code - id of the product to be retrieved.
//
function product_page(product_code) {
  fetch_url = `/product/get/${product_code}`;

  fetch(fetch_url, {
    method: "GET",
  })
    .then(function (response) {
      if (response.status >= 200 && response.status < 300) {
        // Post message successfully
        // hide div with used to display error message
        document.querySelector("#error-message").innerHTML = "";
        document.querySelector("#error-message").style.display = "none";
        return response.json();
      } else {
        // Error was returned. Extract error content.
        response.json().then(function (data) {
          // Display error message.
          document.querySelector("#error-message").innerHTML = data.error;
          document.querySelector("#error-message").style.display = "block";
          window.scrollTo(0, 0);
          return false;
        });
      }
    })
    .then((response) => {
      render_product(response);
    });

  event.preventDefault();
}

/*  product_api(product_code).then(function (reponse) {
    if (response.status >= 200 && response.status < 300) {
      // Post message successfully
      // hide div with used to display error message
      document.querySelector("#error-message").innerHTML = "";
      document.querySelector("#error-message").style.display = "none";
      render_product(response.json());
    } else {
      // Error was returned. Extract error content.
      response.json().then(function (data) {
        // Display error message.
        document.querySelector("#error-message").innerHTML = data.error;
        document.querySelector("#error-message").style.display = "block";
        window.scrollTo(0, 0);
        return false;
      });
    }
  });

  event.preventDefault();
}
*/

//
// Function to render the navigation page bar
// Parameter : dict - page dictionary to get information in each page we are and total count.
//             filter - filter applied in the queryset.
//
function render_product_catalog(response, filter) {
  // initialize temp variables
  let grid_lines = "";
  let grid_line = "";

  // header content for the grid
  const grid_header = `
  <div class="row">
    <div class="col-sm-1" style="background-color:grey;"></div>
    <div class="col-sm-1" style="background-color:grey;">Code</div>
    <div class="col-sm-2" style="background-color:grey;">Name</div>
    <div class="col-sm-4" style="background-color:grey;">Description</div>
    <div class="col-sm-2" style="background-color:grey;">Category</div>
    <div class="col-sm-2" style="background-color:grey;">Model</div>
  </div>`;

  // loop all products
  for (product of response["products"]) {
    const {
      id,
      code,
      name,
      description,
      category,
      model,
      imagem,
      //stocks,
      owner,
      change,
      creation_date,
    } = product; // object deconstruction.

    // Display edit button according user's profile and item status.
    btn_edit = "";
    if (owner) {
      // User is the product owner for the line or admin user,
      // so edit or approve change button must be displayed.
      btn_edit = `
        <div class="row">
          <div class="col-sm-6" style="background-color:white;">
            <input type="button" class="btn btn-warning btn-sm" onclick="edit_product_page('${code}')" value="Edit">
          </div>
          <div class="col-sm-6" style="background-color:white;">
            <input type="button" class="btn btn-danger btn-sm" onclick="btn_product_delete('${code}')" value="Del">
          </div>
        </div>
          `;
    }

    // grid element
    grid_line = `
      <div class="row">
        <div id="product-item-btnedit-${id}" class="col-sm-1" style="background-color:white;">${btn_edit}</div>
        <div class="col-sm-1" onClick="product_page('${code}')"  style="background-color:white; cursor:pointer">${code}</div>
        <div class="col-sm-2" onClick="product_page('${code}')"  style="background-color:white; cursor:pointer">${name}</div>
        <div class="col-sm-4" style="background-color:white;">${description}</div>
        <div class="col-sm-2" style="background-color:white;">${category}</div>
        <div class="col-sm-2" style="background-color:white;">${model}</div>
      </div>`;
    grid_lines = grid_lines + grid_line;
  }

  // add the navigation bar
  const html =
    grid_header +
    grid_lines +
    `<div class="row">
      <div class="col-sm-12" style="background-color:white;"></div>
    </div>` +
    //"</div>" +
    render_navigation(filter, response["pages"]);

  // Update the contend and call function to display only the page requested.
  document.querySelector("#product-list-grid").innerHTML = html;
  display_page("product-list");

  return true;
}

//
// Function responsible to retrieve the products and class render_products
// Input:
//       filter - filter contains parameters needed to filter the query set.
//       offset - defines which set of records need to be returned, based on the pagination selected.
//
function product_catalog_page(filter, offset) {
  // define the filter.
  fetch_url = `/product/catalog?f=${filter}&offset=${offset}`;

  fetch(fetch_url, {
    method: "GET",
  })
    .then(function (response) {
      if (response.status >= 200 && response.status < 300) {
        // Post message successfully
        // hide div with used to display error message
        document.querySelector("#error-message").innerHTML = "";
        document.querySelector("#error-message").style.display = "none";
        return response.json();
      } else {
        // Error was returned. Extract error content.
        response.json().then(function (data) {
          // Display error message.
          document.querySelector("#error-message").innerHTML = data.error;
          document.querySelector("#error-message").style.display = "block";
          window.scrollTo(0, 0);
          return false;
        });
      }
    })
    .then((response) => {
      render_product_catalog(response, filter);
    });

  event.preventDefault();
}
