// ebay.js

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}


let isHighlighted = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleHighlight') {
    // Select all item cards on the eBay page. The selector might need adjustment based on eBay's HTML structure.
    const itemCards = document.querySelectorAll('.s-item');
    isHighlighted = !isHighlighted;
    console.log(itemCards);
    itemCards.forEach(card => {
      // Toggle the border
      card.style.border = isHighlighted ? '2px solid blue' : 'none';

      // Log the entire item card
      // console.log(card);
      const itemName = card.querySelector('.s-item__title');
      // if (itemName) {
      //   console.log(itemName.textContent.trim());
      // }
    });

    sendResponse({ status: 'Item cards border toggled' });
  } else if (request.action === 'reverseItems') {
    // Select all item cards on the eBay page and convert NodeList to Array
    let resultsList = document.querySelector('.srp-results');
    console.log(resultsList);
    
    // Check if the parent ul element exists
    if (resultsList) {
      // Get all child 'li' elements
      let listItems = Array.from(resultsList.querySelectorAll('li'));

      // Separate the first two items and the rest
      let firstTwoItems = listItems.slice(0, 2);
      let restOfItems = listItems.slice(2);

      // Shuffle the rest of the items
      let shuffledRestOfItems = shuffle(restOfItems);

      // Clear the current list
      resultsList.innerHTML = null;

      // Append the first two items back to the parent ul element
      firstTwoItems.forEach(item => {
          resultsList.appendChild(item);
      });

      // Append the shuffled rest of the items back to the parent ul element
      shuffledRestOfItems.forEach(item => {
          resultsList.appendChild(item);
      });
      console.log(resultsList);
    } else {
      console.log("No element found with the class 'srp-results'");
    }
    sendResponse({ status: 'Items reversed except first two' });
  }
