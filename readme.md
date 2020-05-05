# Dotrack - Application

#### Hours Worked

60 hours

#### Design features and considerations

- One single page application approach.
- Any table where needs to be managed by administrative user were added to Django Admin Feature.
- APIs and user management at Django side, presentation using Javascript. This approach will allow me to convert this application to React in future.
- URLs convention designed to assure simplicity to understand the meaning of each one.
- Not able yet to balance, when a page must be done using Django+Template layout feature or single page approach Django API + Presetation on Javascript. I had impression one page implementation, in some cases takes more time than using Django Template feature.
- Standard page layout can be found in the file layout.html
- Core single page is in the file index.html, there are three main sections (div pages):
  - product-list : displays the product catalog page, where the products are presented using a grid with pagination.
  - product-item : displays the product page.
  - product-update : form used to add or update the product.
- Not correctlly implemeted yet, but the idea was, when the user returns to the product catalog, it doesn´t need to reload the data, but just give visibiliy to the div section because the data was already there. It was pending solve the issue after a product is edited or added.
- Pagination implemented as in the previous project : Api returns also the page data required to render/implement the navigation buttons.
- Javascript code organization:
  - Render a page process applied accross all pages in general:
    - HTML element (Link or button) - Call a javascript function to open the page
      - Javascrip Page Function - Uses javascript fetch function to invoke the Django API to return the data.
        - Render Page Function - Receives the data, so render the page accordinly the features needed.
          - Load Page Function - Once page is rendered, display only the pages needed, hides all others.
- Due to my lack of knowledege on how the promisse works with the javascript Fetch function, I couldn´t totally separate the invoke of the django api, from the presentation function, for example you will se some hidden codes, where I was trying to implement just one api function resposible to retrieve the product data and return the response data so another function would receive this response to use the data to view product page or open product edit page. In the end I created two invokes javascrit api : edit_product_page (api) + render_product_edit and add_product_page (api) + render_product_add, while I couldn´t implement (render_product_edit and render_product_add) -> api_product_data.

#### Functions implemented

- The whole database model.
- Tables with common data, managed by administrative user, were added to the Django Admin function.
- User : Self-Registration
- Product - Add / View / Update implemented.
  - Pagination implemented.
- Product Catalog - implemented with the search on the product name only.
- Functions based on the profile
  - Buttons "Edit" / "Delete" are displayed just in case the user is the product owner of the product category on which the product belongs.
  - Add product page : The product category list box displays only the categories on which the user has permission to manage, so he adds products of a specific set of categories.

#### Functions NOT implemented

- CSS file not implemented as expected yet.
- Profile page.
- User can be self registered, but the access can be granted when administrative user assigns a user profile to the user.
- Product:
  - Add product must be restricted to specific profiles.
  - Delete
- Product Catalog:
  - Filter must be applied also on product code and description fields.
  - Filter based on product category.
- Demand Page - View / Add / Update
- Demand change approval process.
  - When changes are approved, warning message must be displayed when stock became equal or lower than zero.
- Standard page footer across all pages.

#### Not working

- When the product is updated, the product catalog page is not refreshed, so it doesn´t display yet the latest data, this wasn't done yet because I will implement using React in future, so I concentrated in others functions, due to my lack of time.
