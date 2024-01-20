const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  return blogs.map((blog) => blog.likes).reduce((sum, value) => sum + value, 0);
};

const favoriteBlog = (blogs) => {
  let mostLikedBlog = blogs.length ? blogs[0] : {};
  blogs.forEach((blog) => {
    if (blog.likes > mostLikedBlog.likes) {
      mostLikedBlog = blog;
    }
  });
  const { likes, title, author } = mostLikedBlog;
  return { likes, title, author };
};

const mostBlogs = (blogs) => {
  const blogsCount = {};
  blogs.forEach((blog) => {
    blogsCount[blog.author] = (blogsCount[blog.author] || 0) + 1;
  });
  const topWriter = { author: "Anonymous", blogs: -1 };
  for (const writer in blogsCount) {
    if (blogsCount[writer] > topWriter.blogs) {
      topWriter.author = writer;
      topWriter.blogs = blogsCount[writer];
    }
  }
  return blogs.length > 0 ? topWriter : {};
};

const mostLikes = (blogs) => {
  const likesCount = {};
  blogs.forEach((blog) => {
    likesCount[blog.author] = (likesCount[blog.author] || 0) + blog.likes;
  });
  const mostLikedAuthor = { author: "Anonymous", likes: -1 };
  for (const writer in likesCount) {
    if (likesCount[writer] > mostLikedAuthor.likes) {
      mostLikedAuthor.author = writer;
      mostLikedAuthor.likes = likesCount[writer];
    }
  }
  return blogs.length > 0 ? mostLikedAuthor : {};
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
