import { useEffect, useState } from "react";
import Select from "react-select";
import classes from "./AddDropdown.module.css";
import TooltipLarge from "../Tooltip/TooltipLarge";
import ConfirmModal from "../ConfirmModal/ConfirmModal";

const AddDropdown = (props) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const changeHandler = (choice) => {
    let newArrayOfObj;
    if (props.isMulti) {
      newArrayOfObj = choice.map(({ value }) => ({
        [props.name + "Id"]: value,
      }));
    }
    if (!props.isMulti) {
      newArrayOfObj = [choice].map(({ value }) => ({
        [props.name + "Id"]: value,
      }));
    }

    if (newArrayOfObj.length > 0) {
      props.onChange(newArrayOfObj);
    } else {
      props.onChange([{ value: props.name }]);
    }
  };

  const inputChangeHandler = (e) => {
    if (props.onInputChange) {
      props.onInputChange(e);
    }
  };

  const mouseEnterHandler = () => {
    setShowTooltip(true);
  };
  const mouseLeaveHandler = () => {
    setShowTooltip(false);
  };
  const declineHandler = () => {
    props.onDecline(props.name);
  };
  return (
    <div
      onMouseEnter={mouseEnterHandler}
      onMouseLeave={mouseLeaveHandler}
      className={
        props.cssClass ? classes[props.cssClass] : classes.dropdownFilters
      }
    >
      {props.topLabel && <label>{props.topLabel}</label>}
      {props.onErrorMessage && props.onErrorMessage !== "" && showTooltip && (
        <div className={classes.tooltip}>
          <TooltipLarge index={props.index} message={props.onErrorMessage} />
        </div>
      )}

      <Select
        placeholder={props.label}
        options={props.options}
        onChange={changeHandler}
        isMulti={props.isMulti ? true : false}
        isClearable={false}
        onInputChange={inputChangeHandler}
        noOptionsMessage={(value) => (value = "")}
        value={
          props.value === ""
            ? props.value
            : props.options.filter(({ value }) => {
                if (typeof props.value === "number")
                  return value === props.value;
                return props.value?.find((v) => {
                  return Object.values(v)[0] === value;
                });
              })
        }
      />
      {props.modalMessage?.show && (
        <div className={classes.confirmModal}>
          <ConfirmModal
            modalMessage={props.modalMessage?.message}
            topArrow={true}
            onConfirm={props.onConfirm}
            onDecline={declineHandler}
          />
        </div>
      )}
      {props.hasError && <div className={classes.errorHandling} />}
    </div>
  );
};

export default AddDropdown;
