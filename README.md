# E-commerce Website with Recommendations

This project showcases an e-commerce website with a basic recommendation system, developed by me. The front-end is built using **HTML, CSS, and JavaScript**, while the back-end leverages **Node.js and Express**. The focus of this project was on implementing a working **content-based recommendation system** within a simplified e-commerce context.

## Key Features

- **Intuitive Product Browsing:** Users can explore products effortlessly through a clean and organized user interface.
- **Category Filtering & Sorting:** Product searches can be refined using category filters and sorted by price or name.
- **Product Details & Recommendations:** Comprehensive product details are provided, along with similar item suggestions. The recommendation system enhances product discovery by suggesting relevant products.
- **Shopping Cart:** Users can add desired products to their cart and manage its contents seamlessly. Cart data is persisted using local storage.
- **Responsive Design:** A consistent shopping experience is maintained across various devices, thanks to the responsive design.
- **Content-Based Recommendations:** The recommendation engine analyzes product descriptions using **TF-IDF** to identify and suggest similar products, providing relevant recommendations based on product content.

## Project Overview and Challenges

While building this project, I encountered and resolved several challenges, particularly regarding image handling and server configuration:

- **Image Management:** Serving images from the Node.js server was initially a challenge. Direct references to image files from the HTML resulted in broken image links. I resolved this by configuring a specific route in `server.js` to serve static image files from the `/images` directory, making them accessible to the front end.
- **Port Conflicts:** Frequent port conflicts occurred during development. To address this, I configured the project to use either the environment variable `PORT` or default to **port 3000**. This dynamic port allocation ensures smoother execution, regardless of other processes running on the system.
- **Recommendation Scope:** The current recommendation system is functional but limited by the small number of product categories (**4**). This means that recommendations are currently confined to items within the same category. Expanding the dataset with more categories and implementing advanced algorithms would significantly improve the system's ability to provide diverse and personalized recommendations.

## Getting Started

### Prerequisites  
Ensure you have **Node.js** and **npm** installed on your system. If not, download and install them from [Node.js official site](https://nodejs.org/).

### Clone the Repository  
```bash
git clone https://github.com/yourusername/your-repo-name.git
```

### Install Dependencies  
Navigate to the project directory in your terminal and install the required npm packages:  
```bash
cd your-repo-name  # Replace with your repo name
npm install
```

### Start the Development Server  
Launch the development server using either of the following commands:  
```bash
npm start       # Starts the server
npm run dev    # Starts the server with nodemon (automatic restarts on file changes)
```

The website should now be accessible in your web browser at **http://localhost:3000** (or a different port if specified).

## Recommendation Engine Deep Dive

This e-commerce site utilizes a **content-based recommendation** approach powered by **TF-IDF (Term Frequency-Inverse Document Frequency)**. This technique analyzes the text descriptions of products, calculating the importance of each word within the context of all product descriptions. When a user views a product, the engine compares its description to others and recommends those with the highest similarity scores. This provides a simple yet effective way to suggest related products based on their content.

## Future Enhancements

- **Enhanced Recommendations:** Improve the recommendation engine by adding more product categories and implementing more sophisticated algorithms, such as **collaborative filtering** or hybrid approaches.
- **User Authentication:** Implement user login and registration to personalize the shopping experience and enable features like order history and saved addresses.
- **Payment Integration:** Integrate a **payment gateway** to enable secure online transactions.
- **Database Integration:** Replace sample data with a **robust database solution** for scalable product management and user data storage.
- **Admin Panel:** Develop an administrative interface for managing products, categories, and users.

This **README.md** provides a detailed overview of my project, making it more informative and engaging for readers.  

