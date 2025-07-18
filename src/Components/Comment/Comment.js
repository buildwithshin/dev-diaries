import React, { useState, useEffect } from 'react';
import { ListGroup, Button, Modal, Alert } from 'react-bootstrap';
import Swal from 'sweetalert2';

export default function Comments({ blogId, onClose }) {
  const [comments, setComments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state to track fetching process

  // Fetch comments for the specific blog
  useEffect(() => {
    if (!blogId) return; // Do nothing if no blogId is passed

    setLoading(true); // Set loading state to true before starting the fetch
    fetch(`https://dev-diaries-api.onrender.com/comments/blog/${blogId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include the auth token
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setComments(data);
        } else {
          setError('Failed to fetch comments');
        }
        setLoading(false); // Set loading state to false after fetching is complete
      })
      .catch((err) => {
        setError('Failed to fetch comments');
        setLoading(false); // Set loading state to false in case of an error
        Swal.fire('Error', 'Failed to fetch comments', 'error');
      });
  }, [blogId]);

  // Handle comment deletion
  const handleDeleteComment = (commentId) => {
    fetch(`https://dev-diaries-api.onrender.com/comments/delete/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include the auth token
      },
    })
      .then(() => {
        setComments(comments.filter((comment) => comment._id !== commentId)); // Remove the deleted comment from state
        Swal.fire('Success', 'Comment deleted successfully!', 'success');
      })
      .catch((err) => {
        setError('Failed to delete comment');
        Swal.fire('Error', 'Failed to delete comment', 'error');
      });
  };

  return (
    <Modal show={true} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Comments</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {loading ? (
          <div>Loading comments...</div> // Display a loading message while fetching
        ) : (
          <>
            <h6>Comments:</h6>
            <ListGroup>
              {comments.length === 0 ? (
                <ListGroup.Item>No comments available</ListGroup.Item>
              ) : (
                comments.map((comment) => (
                  <ListGroup.Item key={comment._id}>
                    <strong>{comment.user.firstName} {comment.user.lastName}</strong> <br />
                    {comment.comment}
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteComment(comment._id)}
                      size="sm"
                      className="float-end"
                    >
                      Delete Comment
                    </Button>
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
