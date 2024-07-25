// Function to shuffle array in place
var page_type = null;

async function shuffle(resultsList, array, item_title_query_selector, customer_id,item_identification_id ) {
  // Log the titles of the items before shuffling
  let sorted_array = [];
  let items_param_string = 'http://localhost:9000/api/order_by_name/?user_id=' + encodeURIComponent(customer_id);
  console.log('item_title_query_selector', item_title_query_selector);
  console.log("type",typeof  (array[0]))
  array.forEach(item => {
    const titleElement = item.querySelector(item_title_query_selector);
    if (titleElement) {
      console.log('Item title:', titleElement.textContent.trim());
      items_param_string += "&item_name=" + encodeURIComponent(titleElement.textContent.trim());
    }
  });

  console.log(items_param_string);

  try {
    const response = await fetch(items_param_string);
    const data = await response.json();
    console.log('API Response:', data);

    data.item_names.forEach(itemName => {
      array.forEach(item => {
        const titleElement = item.querySelector(item_title_query_selector);
        if (titleElement && titleElement.textContent.trim() === itemName) {
          sorted_array.push(item);
        }
      });
    });

    sorted_array.forEach((item, index) => {
      // const resultsList_obj = resultsList.querySelector(item);
      console.log(item.getAttribute(item_identification_id))
      console.log(array[index])
      const id = array[index].getAttribute(item_identification_id);
      // Find the element within `resultsList` using `querySelector`
      console.log(id)
      // var element = resultsList.querySelector(`[${item_identification_id}="${id}"]`);
      var element = resultsList.querySelector(`#${id}`);
      console.log(element)
      // Replace or manipulate the element as needed
      if (element) {
        // Do something with the element, e.g., replace it
        resultsList.replaceChild(item, element);
      }
    //   if (element) {
    //     // Clone the item to preserve it in the DOM
    //     // const itemClone = item.cloneNode(true);

    //     // Check if element is a direct child of resultsList
    //     if (1==1) {
    //       // Replace the original item with the cloned item
    //       resultsList.replaceChild(item, element);
    //     } else {
    //       // Find the parent of the element and replace it
    //       console.log("parentElement")
    //       const parentElement = element.parentNode;
    //       console.log(parentElement)
    //       if (parentElement) {
    //         parentElement.replaceChild(itemClone, element);
    //       } else {
    //         console.error('Parent element not found for:', element);
    //       }
    //     }
    //   }
      
    });
  } catch (error) {
    console.error('Error :', error);
  }

  console.log(resultsList);
  return resultsList;
}

// Function to shuffle eBay search results
async function shuffleSearchResults(title_css, list_attribute, list_attribute_value, item_title_query_selector, customer_id, list_selector_type, list_css, items_to_drop,item_identification_id) {
  console.log('title_css :', title_css);
  console.log('Shuffling eBay search results...');
  let resultsList = null;
  // Find the results list container
  resultsList = document.querySelector(title_css);
  console.log(resultsList)
  if (resultsList) {
    console.log('Results list:', resultsList);

    // Select all list items within the results list
    let listItems = null;
    if (list_selector_type == "STYLE") {
      listItems = Array.from(resultsList.querySelectorAll(list_css));
    } else {
      listItems = Array.from(resultsList.querySelectorAll(list_attribute));
    }
    console.log("itemList", listItems)
    if (listItems.length > 2) {
      console.log('Found more than 2 items:', listItems.length);

      // Split the list items into first two and the rest
      var firstTwoItems = []
      var restOfItems = []
      if (items_to_drop > 0) {
        firstTwoItems = listItems.slice(0, items_to_drop);
        restOfItems = listItems.slice(items_to_drop);
      } else {
        restOfItems = listItems;
      }

      // Shuffle the rest of the items
      const shuffledRestOfItems = await shuffle(resultsList, restOfItems, item_title_query_selector, customer_id,item_identification_id);

      resultsList = shuffledRestOfItems

      console.log('Items shuffled successfully.');
    } else {
      console.log('Not enough items to shuffle.');
    }
  } else {
    console.log("No element found with the class ", title_css);
  }
}

// Function to shuffle eBay search results
function sendItemTitle(title_css, customer_id) {
  console.log('title_css :', title_css);
  let resultsList = null;
  // Find the results list container
  title_css.split("/").forEach(title => {
    console.log(title);
    resultsList = document.querySelector(title);
  });
  // const resultsList = document.querySelector('vi-title');
  console.log('Results list found:', resultsList.textContent);
  const apiUrl = 'http://localhost:9000/api/get_user_preference/?item_name=' + encodeURIComponent(resultsList.textContent) + '&user_id=' + encodeURIComponent(customer_id);

  return fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      console.log('API Response:', data);
    })
    .catch(error => {
      console.error('Error fetching the URL pattern:', error);
      // return false;
    });
}

// Function to check if the current URL is in the system by making an API call
function shouldShuffle(url, customer_id) {
  const apiUrl = `http://localhost:9000/api/search_by_url_pattern/?url=${encodeURIComponent(url)}`;

  return fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      console.log('API Response:', data);
      if (data.is_in_system === 1) {
        if (data.data.page_type == "SEARCH") {
          shuffleSearchResults(data.data.title_css, data.data.list_attribute, data.data.list_attribute_value, data.data.item_title_query_selector, customer_id, data.data.list_selector_type, data.data.list_css, data.data.items_to_drop,data.data.item_identification_id);
        }
        if (data.data.page_type == "ITEM") {
          sendItemTitle(data.data.title_css, customer_id);
        }
        console.log(data.data.page_type)
        // return true;
      } else {
        console.log('URL is not in the system.');
        // return false;
      }
    })
    .catch(error => {
      console.error('Error fetching the URL pattern:', error);
      // return false;
    });
}

// Automatically shuffle items when the page has loaded if the URL matches the patterns
const currentUrl = window.location.href;
let customer_id = null; // Use 'let' instead of 'var'
// Retrieve the stored user ID
chrome.storage.sync.get(['token', 'customer_id'], function (result) {
  if (result.token && result.customer_id) {
    console.log('Token retrieved: ' + result.token);
    console.log('Customer ID retrieved: ' + result.customer_id);
    customer_id = result.customer_id;
    shouldShuffle(currentUrl, result.customer_id);
    // Use the token and customer ID as needed
  } else {
    console.log('No token or customer ID found.');
  }
});

console.log("sdsdsdsdsdsdsfsdfsdfsdfsdfds", page_type)
