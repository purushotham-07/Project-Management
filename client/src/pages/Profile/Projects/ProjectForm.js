import { Form, Input, message, Modal, Select, DatePicker } from "antd";
import TextArea from "antd/es/input/TextArea";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { SetLoading } from "../../../redux/loadersSlice";
import { CreateProject, EditProject } from "../../../apicalls/projects";
import "./ProjectForm.css";

function ProjectForm({ show, setShow, reloadData, project }) {
  const formRef = React.useRef(null);
  const { user } = useSelector((state) => state.users);
  const dispatch = useDispatch();

  const onFinish = async (values) => {
    try {
      dispatch(SetLoading(true));
      let response = null;
      const payload = { ...values };
      // Format deadline to ISO string if present
      if (payload.deadline) {
        payload.deadline = payload.deadline.toISOString();
      }

      if (project) {
        payload._id = project._id;
        response = await EditProject(payload);
      } else {
        payload.owner = user._id;
        payload.members = [
          {
            user: user._id,
            role: "owner",
          },
        ];
        response = await CreateProject(payload);
      }

      if (response.success) {
        message.success(response.message);
        reloadData();
        setShow(false);
      } else {
        throw new Error(response.message);
      }
      dispatch(SetLoading(false));
    } catch (error) {
      dispatch(SetLoading(false));
      message.error(error.message);
    }
  };

  return (
    <Modal
      title={project ? "EDIT PROJECT" : "CREATE PROJECT"}
      open={show}
      onCancel={() => setShow(false)}
      centered
      width={window.innerWidth < 768 ? "95%" : 700}
      onOk={() => {
        formRef.current.submit();
      }}
      okText="Save"
    >
      <Form
        layout="vertical"
        ref={formRef}
        onFinish={onFinish}
        initialValues={{
          ...project,
          deadline: project?.deadline ? null : null, // DatePicker needs moment/dayjs
        }}
        className="project-form-container"
      >
        <Form.Item
          label="Project Name"
          name="name"
          rules={[
            { required: true, message: "Please enter the project name" },
          ]}
        >
          <Input placeholder="Enter project name" />
        </Form.Item>

        <Form.Item
          label="Project Description"
          name="description"
          rules={[
            { required: true, message: "Please enter the project description" },
          ]}
        >
          <TextArea
            placeholder="Enter project description"
            autoSize={{ minRows: 3, maxRows: 5 }}
          />
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Form.Item label="Project Status" name="projectStatus">
            <Select>
              <Select.Option value="Planning">Planning</Select.Option>
              <Select.Option value="Active">Active</Select.Option>
              <Select.Option value="On Hold">On Hold</Select.Option>
              <Select.Option value="Completed">Completed</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Visibility" name="visibility">
            <Select>
              <Select.Option value="Public">Public</Select.Option>
              <Select.Option value="Private">Private</Select.Option>
            </Select>
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Form.Item label="Tags (comma separated)" name="tags">
            <Select
              mode="tags"
              placeholder="Enter tags and press enter"
              tokenSeparators={[","]}
            />
          </Form.Item>

          <Form.Item label="Tech Stack (comma separated)" name="techStack">
            <Select
              mode="tags"
              placeholder="Enter tech stack and press enter"
              tokenSeparators={[","]}
            />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Form.Item label="Deadline" name="deadline">
            <DatePicker
              className="w-full"
              placeholder="Select deadline"
            />
          </Form.Item>

          <Form.Item label="Cover Image URL" name="coverImage">
            <Input placeholder="Enter image URL" />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}

export default ProjectForm;