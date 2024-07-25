document.getElementById('login-form').addEventListener('submit', function(event) {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  fetch('http://localhost:9000/api/login/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: username,
      password: password
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.token) {
      chrome.storage.sync.set({ token: data.token, customer_id: data.customer_id }, function() {
        console.log('User logged in. Token and customer ID are set.');
      });
    } else {
      console.error('Login failed:', data);
    }
  })
  .catch(error => console.error('Error:', error));
});

document.getElementById('register-form').addEventListener('submit', function(event) {
  event.preventDefault();
  const username = document.getElementById('reg-username').value;
  const password = document.getElementById('reg-password').value;
  const email = document.getElementById('reg-email').value;
  const firstName = document.getElementById('first_name').value;
  const lastName = document.getElementById('last_name').value;
  const searchInterest = document.getElementById('search_interest').value;

  fetch('http://localhost:9000/api/register/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      user: {
        username: username,
        password: password,
        email: email
      },
      first_name: firstName,
      last_name: lastName,
      email: email,
      search_intrest_string: searchInterest
    })
  })
  .then(response => response.json())
  .then(data => {
    console.log(data);
    if (data.token) {
      chrome.storage.sync.set({ token: data.token, customer_id: data.customer_id }, function() {
        console.log('User registered. Token and customer ID are set.');
      });
    } else {
      console.error('Registration failed:', data);
    }
  })
  .catch(error => console.error('Error:', error));
});
