import React, { useEffect } from "react";
import { Form, Input, Button, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { UpdateProfile } from "../../apicalls/users";
import { SetButtonLoading } from "../../redux/loadersSlice";
import { SetUser } from "../../redux/usersSlice";
import Divider from "../../components/Divider";

function General() {
  const { user, buttonLoading } = useSelector((state) => ({
    ...state.users,
    ...state.loaders,
  }));
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        firstName: user.firstName,
        lastName: user.lastName,
        linkedin: user.linkedin || "",
        github: user.github || "",
      });
    }
  }, [user, form]);

  const onFinish = async (values) => {
    try {
      dispatch(SetButtonLoading(true));
      const response = await UpdateProfile(values);
      dispatch(SetButtonLoading(false));
      if (response.success) {
        message.success(response.message);
        dispatch(SetUser(response.data));
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      dispatch(SetButtonLoading(false));
      message.error(error.message);
    }
  };

  return (
    <div className="w-full max-w-[600px] px-2 md:px-0">
      <h1 className="text-xl text-primary font-semibold mb-4">General Settings</h1>
      <Divider />
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Form.Item
          label="First Name"
          name="firstName"
          rules={[{ required: true, message: "Required" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Last Name"
          name="lastName"
          rules={[{ required: true, message: "Required" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Email" name="email">
          <Input disabled value={user?.email} />
        </Form.Item>
        <Form.Item
          label="LinkedIn Profile URL"
          name="linkedin"
          rules={[
            {
              type: "url",
              message: "Please enter a valid LinkedIn URL",
            },
          ]}
        >
          <Input placeholder="https://www.linkedin.com/in/your-profile" />
        </Form.Item>
        <Form.Item
          label="GitHub Profile URL"
          name="github"
          rules={[
            {
              type: "url",
              message: "Please enter a valid GitHub URL",
            },
          ]}
        >
          <Input placeholder="https://github.com/your-username" />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          loading={buttonLoading}
          className="mt-2"
        >
          {buttonLoading ? "Saving..." : "Save Changes"}
        </Button>
      </Form>
    </div>
  );
}

export default General;