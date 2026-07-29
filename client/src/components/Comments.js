import { Button, Input, message } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AddComment, GetComments } from "../apicalls/comments";
import { SetLoading } from "../redux/loadersSlice";
import { getDateFormat } from "../utils/helpers";

function Comments({ taskId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const dispatch = useDispatch();
  const fetchComments = async () => {
    try {
      dispatch(SetLoading(true));
      const response = await GetComments(taskId);
      dispatch(SetLoading(false));
      if (response.success) {
        setComments(response.data);
      }
    } catch (error) {
      dispatch(SetLoading(false));
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      dispatch(SetLoading(true));
      const response = await AddComment({
        task: taskId,
        content: newComment,
      });
      dispatch(SetLoading(false));
      if (response.success) {
        message.success("Comment added");
        setNewComment("");
        fetchComments();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      dispatch(SetLoading(false));
      message.error(error.message);
    }
  };

  useEffect(() => {
    if (taskId) fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  return (
    <div className="mt-3">
      <div className="flex gap-2 mb-3">
        <Input
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onPressEnter={handleAddComment}
        />
        <Button type="primary" onClick={handleAddComment} disabled={!newComment.trim()}>
          Post
        </Button>
      </div>
      <div className="flex flex-col gap-3 max-h-60 overflow-y-auto">
        {comments.length === 0 && (
          <span className="text-sm text-gray-400">No comments yet</span>
        )}
        {comments.map((comment) => (
          <div key={comment._id} className="border border-solid border-gray-200 p-2 rounded">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-primary">
                {comment.user?.firstName} {comment.user?.lastName}
              </span>
              <span className="text-xs text-gray-400">
                {getDateFormat(comment.createdAt)}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Comments;