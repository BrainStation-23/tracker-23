import { message, Select } from "antd";

interface Props {
  emails: string[];
  setEmails: Function;
}
const InviteSection = ({ emails, setEmails }: Props) => {
  function isValidEmail(email: string) {
    // Regular expression for a simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  const handleChange = (value: string[]) => {
    const validEmails = value.filter((email) => isValidEmail(email));
    if (validEmails.length !== value.length) message.warning("Invalid email");
    setEmails(validEmails);
  };
  return (
    <div className="flex flex-col gap-4 px-2">
      <div className="px-1 text-xl font-semibold text-black">
        Would you like to invite your team mates?
      </div>
      <div className="max-w-[400px]">
        <Select
          mode="tags"
          size={"middle"}
          placeholder="Enter your team members email address"
          value={emails}
          onChange={handleChange}
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
};

export default InviteSection;
