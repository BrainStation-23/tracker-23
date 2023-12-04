import { Checkbox } from "antd";

type Props = {
  checkedOptionList: any;
  setCheckedOptionList: Function;
  options: any[];
};

const TopBarMoreComponent = ({
  checkedOptionList,
  setCheckedOptionList,
  options,
}: Props) => {
  const onChange = (checkedValues: any) => {
    setCheckedOptionList(checkedValues);
  };

  return (
    <div className="custom-checkbox-noMarginInline-wrapper ">
      <Checkbox.Group
        value={checkedOptionList}
        onChange={onChange}
        className="custom-checkbox-noMarginInline-wrapper flex flex-col justify-start"
      >
        {options.map((option) => (
          <Checkbox
            key={Math.random()}
            className="custom-checkbox-noMarginInline-wrapper"
            value={option.value}
          >
            {option.label}
          </Checkbox>
        ))}
      </Checkbox.Group>
    </div>
  );
};

export default TopBarMoreComponent;
