import { useState, useRef } from "react";
import CalendarOneInput from "../UI/Calendar/CalendarOneInput";
import useAutosizeTextArea from "../../hooks/useAutosizeTextArea";
import ConfirmModal from "../UI/ConfirmModal/ConfirmModal";
import { formatMilliseconds } from "../../utils/Format/Date";
import TooltipLarge from "../UI/Tooltip/TooltipLarge";
import content from "../../assets/content/content.json";
import { InputOverlappingLabel } from "../UI/Input/InputOverlappingLabel";
import { isMobile } from "react-device-detect";

const addPrefix = (link) => {
  return link.length > 5
    ? link?.includes("http")
      ? link
      : "https://" + link
    : link;
};

const AddHomework = (props) => {
  const [dateValue, setDateValue] = useState();
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showCofirmationModal, setShowConfirmationModal] = useState(false);
  const [dateIsRemoved, setDateIsRemoved] = useState(false);

  const { homeworkContent, deadline, studyMaterials } =
    content.lectureInformation;
  const { deleteRowMessage } = content.confirmModalMessages;

  const addDateHandler = (event) => {
    event.preventDefault();
    setDateValue(new Date());
    setShowCalendar((prevState) => (prevState = !prevState));
  };
  const textAreaRef = useRef(null);

  const mouseEnterHandler = () => {
    setShowTooltip(true);
  };
  const mouseLeaveHandler = () => {
    setShowTooltip(false);
  };

  const changeHandler = (event) => {
    if (event?.target) {
      event.preventDefault();
    }
    if (event?.name === "extraLink") {
      return props.onChange(
        { ...event, value: addPrefix(event.value) },
        props.index
      );
    }
    if (!event?.target && !event?.name) {
      if (event) {
        setShowCalendar(false);
        setDateValue(event);
      } else {
        setDateValue(undefined);
      }
    }
    props.onChange(event, props.index);
  };

  const removeDateHandler = (event) => {
    event.preventDefault();
    setShowCalendar((prevState) => (prevState = false));
    setDateValue("");
    props.onChange(event, props.index);
    setDateIsRemoved((prevState) => (prevState = !prevState));
  };
  const removeRowHandler = () => {
    setShowConfirmationModal(true);
  };

  const confirmationHandler = () => {
    setShowConfirmationModal(false);
    props.onRemoveRow(props.index, props.homeworkData.id);
  };

  const declineHandler = () => {
    setShowConfirmationModal(false);
  };

  useAutosizeTextArea(textAreaRef.current, props.homeworkData.description);
  let date;
  if (props.homeworkData.dueDate !== "") {
    date = new Date(formatMilliseconds(props.homeworkData.dueDate));
  }

  return (
    <div className="flex flex-col p-4 m-4 border shadow shadow-borderGray">
      <div className="relative flex flex-col lg:flex-row lg:items-start pb-2">
        {showTooltip && !props.onErrors?.descriptionValid.description && (
          <div className="absolute left-1/2 -translate-x-1/2 -top-16">
            <TooltipLarge
              message={props.onErrors?.descriptionValid.errorMessage}
            />
          </div>
        )}
        <div className="realtive mt-2 w-full">
          <textarea
            className={`w-full bg-white ${
              props.onErrors?.descriptionValid.description
                ? "border border-borderGray"
                : "border-2 border-red-500"
            } px-2 py-[0.6rem] border-borderGray resize-none leading-6 hover:border-darkGray duration-200 outline-none rounded-none no-scrollbar`}
            onMouseEnter={mouseEnterHandler}
            onMouseLeave={mouseLeaveHandler}
            placeholder={homeworkContent.placeholder}
            onChange={changeHandler}
            maxLength={2500}
            ref={textAreaRef}
            value={props.homeworkData.description}
            name="description"
          />
          <label
            htmlFor="input"
            className={`absolute left-0 ml-2 text-xs top-0 ${
              props.homeworkData.description
                ? "text-gray-500 bg-white px-1"
                : "text-gray-400 bg-transparent"
            } duration-200`}
          >
            {props.homeworkData.description ? "Iseseisva töö kirjeldus" : ""}
          </label>
        </div>

        <div className="relative hidden lg:flex lg:justify-end space-x-2 px-2 w-24 mt-3">
          {props.index === props.arrayLength - 1 && (
            <i
              onClick={props.onAddRow}
              className="bi bi-plus-lg cursor-pointer text-2xl leading-[unset]"
            ></i>
          )}
          {
            <>
              {showCofirmationModal && !isMobile && (
                <div className="absolute right-16 -top-10">
                  <ConfirmModal
                    modalMessage={deleteRowMessage}
                    onConfirm={confirmationHandler}
                    onDecline={declineHandler}
                    homework={true}
                  />
                </div>
              )}
              <i
                onClick={removeRowHandler}
                className="bi bi-x-lg cursor-pointer text-2xl leading-[unset]"
              ></i>
            </>
          }
        </div>
      </div>
      <div className="flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-4 lg:pr-20">
        <div className="relative pb-2 lg:pb-0">
          <CalendarOneInput
            onClickDay={changeHandler}
            onShowCalendar={showCalendar}
            onClick={addDateHandler}
            value={props.homeworkData.dueDate ? date : ""}
            placeholder={deadline.placeholder}
            index="1"
            name="dueDate"
            errorMessage={props.onErrors?.dueDateValid.errorMessage}
            hasError={!props.onErrors?.dueDateValid.dueDate}
            onReset={dateIsRemoved}
            overlapping={true}
          />
          {dateValue && (
            <i
              id="removeDate"
              onClick={removeDateHandler}
              className="bi bi-x-lg absolute text-xl z-5 right-2 top-1/2 -translate-y-1/2 pb-2 lg:pb-2"
            ></i>
          )}
        </div>

        <div className="pb-3 lg:w-full lg:pr-2">
          <InputOverlappingLabel
            onChange={changeHandler}
            placeholder={studyMaterials.placeholder}
            name="extraLink"
            value={props.homeworkData.extrasLink}
            errorMessage={props.onErrors?.extrasLinkValid.errorMessage}
            hasErrors={props.onErrors?.extrasLinkValid.extrasLink}
          />
        </div>

        <div className="relative flex justify-center w-full lg:hidden px-2">
          {props.index === props.arrayLength - 1 && (
            <i
              onClick={props.onAddRow}
              className="hidden lg:visible bi bi-plus-lg cursor-pointer text-3xl leading-[unset]"
            ></i>
          )}
          {
            <>
              {showCofirmationModal && (
                <div className="absolute right-16 -top-10">
                  <ConfirmModal
                    modalMessage={deleteRowMessage}
                    onConfirm={confirmationHandler}
                    onDecline={declineHandler}
                    homework={true}
                  />
                </div>
              )}
              <i
                onClick={removeRowHandler}
                className="bi bi-x-lg cursor-pointer text-3xl leading-[unset]"
              ></i>
            </>
          }
        </div>
      </div>
    </div>
  );
};

export default AddHomework;
