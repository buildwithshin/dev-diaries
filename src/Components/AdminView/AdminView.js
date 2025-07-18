import React, { useState, useEffect } from 'react';
import { Button, Form, ListGroup, Modal, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // Import SweetAlert2
import './AdminView.css';

export default function AdminView() {
  const [blogs, setBlogs] = useState([]); // Store the list of blogs
  const [newBlog, setNewBlog] = useState({ title: '', content: '' });
  const [editingBlog, setEditingBlog] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [commentModal, setCommentModal] = useState(false); // State to control comment modal
  const [selectedBlogId, setSelectedBlogId] = useState(null); // To store which blog's comments are being viewed
  const [comments, setComments] = useState([]); // Store comments for the selected blog
  const navigate = useNavigate();

  // Fetch all blogs when the component mounts
  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = () => {
    fetch('https://dev-diaries-api.onrender.com/blogs/all', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include the auth token
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch blogs');
        }
        return response.json();
      })
      .then((data) => {
        console.log('Received data:', data);  // Log the structure of the response
        if (Array.isArray(data)) {
          setBlogs(data);
        } else {
          setError('Failed to load blogs');
          console.log('Error: Response format unexpected:', data); // Log unexpected response
        }
      })
      .catch((err) => {
        setError('Failed to fetch blogs');
        console.error(err);  // Log error details for debugging
        Swal.fire('Error', 'Failed to fetch blogs', 'error');
      });
  };

  // Fetch comments for a specific blog
  const fetchComments = (blogId) => {
    fetch(`https://dev-diaries-api.onrender.com/comments/blog/${blogId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setComments(data); // Save comments to state
        } else {
          setError('Failed to load comments');
        }
      })
      .catch((err) => {
        setError('Failed to fetch comments');
        Swal.fire('Error', 'Failed to fetch comments', 'error');
      });
  };

  // Delete a comment
  const handleDeleteComment = (commentId) => {
    fetch(`https://dev-diaries-api.onrender.com/comments/delete/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(() => {
        setComments(comments.filter((comment) => comment._id !== commentId));
        Swal.fire('Success', 'Comment deleted successfully!', 'success');
      })
      .catch((err) => {
        setError('Failed to delete comment');
        Swal.fire('Error', 'Failed to delete comment', 'error');
      });
  };

  // Open the comment modal to view comments
  const handleViewComments = (blogId) => {
    setSelectedBlogId(blogId);
    fetchComments(blogId); // Fetch comments for this blog
    setCommentModal(true); // Open comment modal
  };

  // Create a new blog
  const handleCreateBlog = () => {
    fetch('https://dev-diaries-api.onrender.com/blogs/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include the auth token
      },
      body: JSON.stringify(newBlog),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          // After blog is created, refresh the blogs list
          fetchBlogs();
          setNewBlog({ title: '', content: '' });
          Swal.fire('Success', 'Blog created successfully!', 'success');
        }
      })
      .catch((err) => {
        setError('Failed to create blog');
        Swal.fire('Error', 'Failed to create blog', 'error');
      });
  };

  // Edit a blog
  const handleEditBlog = (blog) => {
    setEditingBlog(blog);
    setShowModal(true);
  };

  // Update a blog (patch)
  const handleUpdateBlog = () => {
    fetch(`https://dev-diaries-api.onrender.com/blogs/edit/${editingBlog._id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(editingBlog),
    })
      .then((response) => response.json())
      .then(() => {
        // After blog is updated, refresh the blogs list
        fetchBlogs();
        setShowModal(false);
        Swal.fire('Success', 'Blog updated successfully!', 'success');
      })
      .catch((err) => {
        setError('Failed to update blog');
        Swal.fire('Error', 'Failed to update blog', 'error');
      });
  };

  // Delete a blog
  const handleDeleteBlog = (id) => {
    fetch(`https://dev-diaries-api.onrender.com/blogs/remove/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    })
      .then(() => {
        setBlogs(blogs.filter((blog) => blog._id !== id));
        Swal.fire('Success', 'Blog deleted successfully!', 'success');
      })
      .catch((err) => {
        setError('Failed to delete blog');
        Swal.fire('Error', 'Failed to delete blog', 'error');
      });
  };

  return (
    <div className="admin-view-container-unique">
      <h2 className="text-center">Admin Dashboard</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <h3>Create a New Blog</h3>
      <Form>
        <Form.Group controlId="formTitle">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter title"
            value={newBlog.title}
            onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
            className="form-input-unique"
          />
        </Form.Group>
        <Form.Group controlId="formContent">
          <Form.Label>Content</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Enter content"
            value={newBlog.content}
            onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
            className="form-input-unique"
          />
        </Form.Group>
        <Button variant="primary" onClick={handleCreateBlog} className="button-unique">
          Create Blog
        </Button>
      </Form>

      <h3>All Blogs</h3>
      <div className="blog-grid-unique">
        {blogs.map((blog) => (
          <div key={blog._id} className="blog-card-unique">
            <h5>{blog.title}</h5>
            <p>{blog.content}</p>
            <p><strong>Author:</strong> {blog.author ? `${blog.author.firstName} ${blog.author.lastName}` : 'Unknown'}</p>
            <Button variant="warning" onClick={() => handleEditBlog(blog)} className="button-unique">
              Edit
            </Button>
            <Button variant="danger" onClick={() => handleDeleteBlog(blog._id)} className="button-unique">
              Delete
            </Button>
            <Button variant="info" onClick={() => handleViewComments(blog._id)} className="button-unique">
              View Comments
            </Button>
          </div>
        ))}
      </div>

      {/* Edit Blog Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Blog</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={editingBlog?.title || ''}
                onChange={(e) =>
                  setEditingBlog({ ...editingBlog, title: e.target.value })
                }
                className="form-input-unique"
              />
            </Form.Group>
            <Form.Group controlId="formContent">
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editingBlog?.content || ''}
                onChange={(e) =>
                  setEditingBlog({ ...editingBlog, content: e.target.value })
                }
                className="form-input-unique"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)} className="button-unique">
            Close
          </Button>
          <Button variant="primary" onClick={handleUpdateBlog} className="button-unique">
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Comments Modal */}
      <Modal show={commentModal} onHide={() => setCommentModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Comments</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            {comments.length > 0 ? (
              comments.map((comment) => (
                <ListGroup.Item key={comment._id}>
                  <strong>Commentor:</strong> {comment.user ? `${comment.user.firstName} ${comment.user.lastName}` : 'Unknown'}<br />
                  <strong>Comment:</strong> {comment.comment || 'No comment available'}<br />
                  <strong>Date:</strong> {new Date(comment.createdAt).toLocaleString() || 'N/A'}<br />
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteComment(comment._id)}
                    className="button-unique"
                  >
                    Delete Comment
                  </Button>
                </ListGroup.Item>
              ))
            ) : (
              <p>No comments available for this blog.</p>
            )}
          </ListGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setCommentModal(false)} className="button-unique">
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
