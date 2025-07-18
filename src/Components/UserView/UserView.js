import React, { useState, useEffect } from 'react';
import { Button, Form, ListGroup, Modal, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './UserView.css';

export default function UserView() {
  const [blogs, setBlogs] = useState([]);
  const [newBlog, setNewBlog] = useState({ title: '', content: '' });
  const [editingBlog, setEditingBlog] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [commentModalShow, setCommentModalShow] = useState(false);
  const [error, setError] = useState('');
  const [selectedBlogId, setSelectedBlogId] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      Swal.fire('Error', 'You are not logged in', 'error');
      return;
    }

    fetch('https://dev-diaries-api.onrender.com/blogs/all', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBlogs(data);
        } else {
          setError('Failed to load blogs');
        }
      })
      .catch((err) => {
        setError('Failed to fetch blogs');
        Swal.fire('Error', 'Failed to fetch blogs', 'error');
      });
  };

  const fetchComments = (blogId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      Swal.fire('Error', 'You are not logged in', 'error');
      return;
    }

    fetch(`https://dev-diaries-api.onrender.com/comments/blog/${blogId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setComments(data);
        } else {
          setError('Failed to load comments');
        }
      })
      .catch((err) => {
        setError('Failed to fetch comments');
        Swal.fire('Error', 'Failed to fetch comments', 'error');
      });
  };

  const handleAddComment = (blogId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      Swal.fire('Error', 'You are not logged in', 'error');
      return;
    }

    fetch(`https://dev-diaries-api.onrender.com/comments/addComment/${blogId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ comment: commentInput }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          Swal.fire('Success', 'Comment added successfully!', 'success');
          setCommentInput('');
          setCommentModalShow(false);
          fetchComments(blogId);
        }
      })
      .catch((err) => {
        setError('Failed to add comment');
        Swal.fire('Error', 'Failed to add comment', 'error');
      });
  };

  const handleCreateBlog = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      Swal.fire('Error', 'You are not logged in', 'error');
      return;
    }

    fetch('https://dev-diaries-api.onrender.com/blogs/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(newBlog),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          // After blog is created, fetch the blogs again to refresh the list
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

  const handleEditBlog = (blog) => {
    setEditingBlog(blog);
    setShowModal(true);
  };

  const handleUpdateBlog = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      Swal.fire('Error', 'You are not logged in', 'error');
      return;
    }

    fetch(`https://dev-diaries-api.onrender.com/blogs/edit/${editingBlog._id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(editingBlog),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data && data._id) {
          // After blog is updated, refresh the blog list
          fetchBlogs();
          setShowModal(false);
          Swal.fire('Success', 'Blog updated successfully!', 'success');
        } else {
          Swal.fire('Error', 'Failed to update blog. Please try again.', 'error');
        }
      })
      .catch((err) => {
        setError('Failed to update blog');
        Swal.fire('Error', 'Failed to update blog', 'error');
      });
  };

  const handleDeleteBlog = (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      Swal.fire('Error', 'You are not logged in', 'error');
      return;
    }

    fetch(`https://dev-diaries-api.onrender.com/blogs/remove/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === 'Blog deleted successfully') {
          setBlogs(blogs.filter((blog) => blog._id !== id));
          Swal.fire('Success', 'Blog deleted successfully', 'success');
        } else {
          Swal.fire('Error', data.message || 'Failed to delete blog', 'error');
        }
      })
      .catch((err) => {
        setError('Failed to delete blog');
        Swal.fire('Error', 'Failed to delete blog', 'error');
      });
  };

  const handleViewComments = (blogId) => {
    setSelectedBlogId(blogId);
    fetchComments(blogId);
    setCommentModalShow(true);
  };

  return (
    <div className="user-view-container">
      <h2 className='text-center'>User Dashboard</h2>
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
            className="form-input"
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
            className="form-input"
          />
        </Form.Group>
        <Button variant="primary" onClick={handleCreateBlog} className="button-unique">
          Create Blog
        </Button>
      </Form>

      <h3>All Blogs</h3>
      <div className="blog-grid">
        {blogs.map((blog) => (
          <div key={blog._id} className="blog-card">
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
                className="form-input"
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
                className="form-input"
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
      <Modal show={commentModalShow} onHide={() => setCommentModalShow(false)} centered>
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
                </ListGroup.Item>
              ))
            ) : (
              <p>No comments available for this blog.</p>
            )}
            <Form>
              <Form.Group controlId="formComment">
                <Form.Label>Add Your Comment</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Write your comment here"
                />
              </Form.Group>
              <Button variant="primary" onClick={() => handleAddComment(selectedBlogId)} className="button-unique">
                Add Comment
              </Button>
            </Form>
          </ListGroup>
        </Modal.Body>
      </Modal>
    </div>
  );
}
