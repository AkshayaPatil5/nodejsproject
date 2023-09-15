const http = require('http');
const fs = require('fs');
const url = require('url');

const feedbackData = [];

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  if (req.method === 'GET' && parsedUrl.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream('index.html').pipe(res);
  } else if (req.method === 'POST' && parsedUrl.pathname === '/submit-feedback') {
    handleFeedbackSubmission(req, res);
  } else if (req.method === 'GET' && parsedUrl.pathname === '/search-feedback') {
    handleFeedbackSearch(req, res, parsedUrl.query.search);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Page not found');
  }
});

function handleFeedbackSubmission(req, res) {
  let data = '';

  req.on('data', (chunk) => {
    data += chunk;
  });

  req.on('end', () => {
    const formData = new URLSearchParams(data);
    const companyName = formData.get('company');
    const pros = formData.get('pros');
    const cons = formData.get('cons');
    const rating = formData.get('rating');

    feedbackData.push({
      company: companyName,
      pros,
      cons,
      rating: parseInt(rating),
    });

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Feedback submitted successfully.');
  });
}

function handleFeedbackSearch(req, res, searchTerm) {
    const searchResults = feedbackData.filter((feedback) => {
      if (feedback && feedback.company) {
        console.log(`Searching for: ${searchTerm}`);
        console.log(`Company in feedback: ${feedback.company}`);
        return feedback.company.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return false;
    });
  
    console.log(`Search results: ${JSON.stringify(searchResults)}`);
  
    const responseHtml = generateSearchResultsHtml(searchResults);
  
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(responseHtml);
  }
  

function generateSearchResultsHtml(results) {
  let html = '<h2>Search Results</h2>';

  if (results.length === 0) {
    html += '<p>No feedback found for the company.</p>';
  } else {
    html += '<ul>';
    results.forEach((feedback) => {
      html += `
        <li>
          <strong>Company:</strong> ${feedback.company || 'N/A'}<br>
          <strong>Pros:</strong> ${feedback.pros || 'N/A'}<br>
          <strong>Cons:</strong> ${feedback.cons || 'N/A'}<br>
          <strong>Rating:</strong> ${feedback.rating || 'N/A'}<br>
        </li>
      `;
    });
    html += '</ul>';
  }

  return html;
}

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});





