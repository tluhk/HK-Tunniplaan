import Modal from "../UI/Modal/Modal";
import NewSubject from "./inputRows/NewSubject";
import { useEffect, useState } from "react";
import axios from "axios";
import NewLecturer from "./inputRows/NewLecturer";
import NewRoom from "./inputRows/NewRoom";
import NewCourse from "./inputRows/NewCourse";
import ConfirmModal from "../UI/ConfirmModal/ConfirmModal";
import config from "../../config.json";
import TooltipLarge from "../UI/Tooltip/TooltipLarge";
import content from "../../assets/content/content.json";
import RequestModal from "../UI/RequestModal/RequestModal";

axios.defaults.baseURL = config.api.url;

const AddNewItem = (props) => {
  const {
    modalFor,
    onNewItem,
    scheduled,
    roomsData,
    courseData,
    lecturerData,
    subjectsData,
    onClose,
    onDelete,
    editMode,
    editValues,
  } = props;
  const {
    deleteMessage,
    roomHasActiveLecturers,
    courseHasActiveLecturers,
    lecturerHasActiveLecturers,
    subjectHasActiveLecturers,
    saveMessage,
  } = content.confirmModalMessages;
  const { mandatoryFields } = content.errorMessages;

  const [inputsState, setInputsState] = useState([{}]);
  const [inputsAreValid, setInputsAreValid] = useState([{ inputs: false }]);
  const [validSubmit, setValidSubmit] = useState(true);
  const [responseId, setResponseId] = useState();
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showUpdateConfirmModal, setShowUpdateConfirmModal] = useState(false);
  const [deleteModalMessage, setDeleteModalMessage] = useState(deleteMessage);
  const [showOverlay, setOverlay] = useState(false);

  const [requestError, setRequestError] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [hideModal, setHideModal] = useState(false);
  const [requestAction, setRequestAction] = useState("");

  const inputsChangeHandler = (inputsObj, rowIndex, validInputs) => {
    setInputsState((prevState) =>
      prevState.map((obj, i) => {
        if (i === rowIndex) return { ...inputsObj };
        return obj;
      })
    );
    setInputsAreValid((prevState) =>
      prevState.map((obj, i) => {
        if (i === rowIndex) return { inputs: validInputs };
        return obj;
      })
    );
  };
  useEffect(() => {
    if (!validSubmit)
      setValidSubmit(
        inputsAreValid.every((isValid) => isValid.inputs === true)
      );
  }, [inputsAreValid, validSubmit]);
  const addNewRowHandler = () => {
    setInputsState((prevState) => {
      return (prevState = [...prevState, {}]);
    });
    setInputsAreValid((prevState) => {
      return (prevState = [...prevState, {}]);
    });
  };
  const removeRowHandler = (index) => {
    setInputsState((prevState) => {
      return [...prevState.filter((e, i) => i !== index)];
    });
    setInputsAreValid((prevState) => {
      return [...prevState.filter((e, i) => i !== index)];
    });
  };

  const submitItemHandler = async () => {
    setOverlay(false);
    const isValid = inputsAreValid.every((isValid) => isValid.inputs === true);
    setValidSubmit(isValid);
    if (isValid) {
      let typeId;
      let responseId = [];
      if (modalFor === "rooms") typeId = "roomId";
      if (modalFor === "courses") typeId = "courseId";
      if (modalFor === "lecturers") typeId = "lecturerId";
      setRequestAction("create");
      try {
        setShowUpdateConfirmModal(false);
        setHideModal(true);
        setShowRequestModal(true);
        setRequestLoading(true);
        for (let state of inputsState) {
          await axios.post(`/${modalFor}`, { ...state }).then((response) => {
            responseId.push({ [typeId]: response.data.id });
            if (modalFor === "subjects")
              onNewItem("subjectId", response.data.id);
            setResponseId(response.data.id);
          });
        }
      } catch (error) {
        setRequestLoading(false);
        setRequestError(true);
        setRequestMessage(content.errorMessages.requestAddError);
        return;
      }

      setRequestLoading(false);
      setRequestMessage(content.successMessages.create);
      setRequestSuccess(true);

      if (responseId.length > 0 && modalFor !== "subjects")
        onNewItem(modalFor, responseId);

      setInputsState([{}]);
      setInputsAreValid([{}]);
    }
  };

  const closeHandler = () => {
    if (modalFor === "subjects" && responseId) return onClose();
    if (responseId) return onClose();
    if (modalFor === "subjects") return onClose("subjectId");
    onClose(modalFor);
  };
  const confirmModalHandler = (event) => {
    if (event.target.name === "delete") {
      let roomBooked = scheduled.filter((row) => {
        if (row.rooms !== "") {
          let arr = row.rooms.filter(
            (room) => room.roomId === inputsState[0].id
          );
          return arr.length > 0 ? row : false;
        }
        return false;
      });
      let courseBooked = scheduled.filter((row) => {
        if (row.courses !== "") {
          let arr = row.courses.filter(
            (course) => course.courseId === inputsState[0].id
          );
          return arr.length > 0 ? row : false;
        }
        return false;
      });
      let lecturerBooked = scheduled.filter((row) => {
        if (row.lecturers !== "") {
          let arr = row.lecturers.filter(
            (lecturer) => lecturer.lecturerId === inputsState[0].id
          );
          return arr.length > 0 ? row : false;
        }
        return false;
      });
      let subjectBooked = scheduled.filter((row) => {
        if (row.subject !== "") {
          return row.subject.id === inputsState[0].id ? row : false;
        }
        return false;
      });

      if (modalFor === "rooms" && roomBooked.length > 0)
        setDeleteModalMessage(roomHasActiveLecturers);
      if (modalFor === "courses" && courseBooked.length > 0)
        setDeleteModalMessage(courseHasActiveLecturers);
      if (modalFor === "lecturers" && lecturerBooked.length > 0)
        setDeleteModalMessage(lecturerHasActiveLecturers);
      if (modalFor === "subject" && subjectBooked.length > 0)
        setDeleteModalMessage(subjectHasActiveLecturers);

      setShowDeleteConfirmModal(true);
      setOverlay(true);
    }

    if (event.target.name !== "delete") {
      const isValid = inputsAreValid.every(
        (isValid) => isValid.inputs === true
      );
      if (!isValid) return setValidSubmit(isValid);
      if (event.target.name === "update") setShowUpdateConfirmModal(true);
      if (event.target.name === "create") setShowUpdateConfirmModal(true);
      setOverlay(true);
    }
  };

  const declineHandler = () => {
    setOverlay(false);
    setShowDeleteConfirmModal(false);
  };

  const declineUpdateHandler = () => {
    setOverlay(false);
    setShowUpdateConfirmModal(false);
  };

  const updateItemHandler = async () => {
    setOverlay(false);
    setRequestAction("update");
    try {
      setShowUpdateConfirmModal(false);
      setOverlay(false);
      setHideModal(true);
      setShowRequestModal(true);
      setRequestLoading(true);
      if (modalFor === "rooms") {
        await axios
          .patch(`/rooms/${editValues}`, inputsState[0])
          .then((response) => console.log(response));
      }
      if (modalFor === "courses") {
        await axios
          .patch(`/courses/${editValues}`, inputsState[0])
          .then((response) => console.log(response));
      }
      if (modalFor === "lecturers") {
        console.log(inputsState[0]);
        await axios
          .patch(`/lecturers/${editValues}`, inputsState[0])
          .then((response) => console.log(response));
      }
      if (modalFor === "subjects") {
        await axios
          .patch(`/subjects/${editValues}`, inputsState[0])
          .then((response) => console.log(response));
      }
    } catch (error) {
      setRequestLoading(false);
      setRequestError(true);
      setRequestMessage(content.errorMessages.requestUpdateError);
      return;
    }

    setRequestLoading(false);
    setRequestMessage(content.successMessages.update);
    setRequestSuccess(true);
  };

  const deleteItemHandler = async () => {
    setRequestAction("delete");
    try {
      setShowDeleteConfirmModal(false);
      setOverlay(false);
      setHideModal(true);
      setShowRequestModal(true);
      setRequestLoading(true);
      if (modalFor === "rooms") {
        await axios
          .delete(`/rooms/${editValues}`)
          .then((response) => console.log(response));
      }
      if (modalFor === "courses") {
        await axios
          .delete(`/courses/${editValues}`)
          .then((response) => console.log(response));
      }
      if (modalFor === "lecturers") {
        await axios
          .delete(`/lecturers/${editValues}`)
          .then((response) => console.log(response));
      }
      if (modalFor === "subjects") {
        await axios
          .delete(`/subjects/${editValues}`)
          .then((response) => console.log(response));
      }
    } catch (error) {
      setRequestLoading(false);
      setRequestError(true);
      setRequestMessage(content.errorMessages.requestDeleteError);
      return;
    }
    setRequestLoading(false);
    setRequestMessage(content.successMessages.delete);
    setRequestSuccess(true);
    setDeleteModalMessage("KUSTUTA");
  };
  useEffect(() => {
    if (!validSubmit) {
      const timer = setTimeout(() => {
        setValidSubmit(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [validSubmit]);

  useEffect(() => {
    if (requestSuccess) {
      const timer = setTimeout(() => {
        if (
          requestMessage === content.successMessages.delete ||
          requestMessage === content.successMessages.update
        ) {
          onDelete();
        }
        onClose();
        setHideModal(false);
        setShowRequestModal(false);
        setRequestSuccess(false);
        setRequestMessage("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [requestSuccess]);

  const endRequestHandler = () => {
    onClose();
  };
  const failedRequestConfirmHandler = () => {
    setRequestError(false);
    setRequestMessage("");
    if (requestAction === "create") submitItemHandler();
    if (requestAction === "delete") deleteItemHandler();
    if (requestAction === "update") updateItemHandler();
  };

  return (
    <Modal onHidden={hideModal} onClose={closeHandler} overlay={showOverlay}>
      <div className="relative flex flex-col lg:pl-4">
        <div className="relative flex justify-end">
          <i
            onClick={closeHandler}
            className={`bi bi-x-lg absolute text-3xl lg:text-xl -top-2 -right-2`}
          ></i>
        </div>
        {modalFor === "subjects" &&
          inputsState.map((inputsRow, i) => {
            return (
              <div key={i}>
                <NewSubject
                  editValues={editValues}
                  editMode={editMode}
                  onAddNewRow={addNewRowHandler}
                  onRemoveRow={removeRowHandler}
                  modalFor={modalFor}
                  onChange={inputsChangeHandler}
                  index={i}
                  subjectsData={subjectsData}
                  values={inputsState[i]}
                  count={inputsState.length}
                />
              </div>
            );
          })}
        {modalFor === "lecturers" &&
          inputsState.map((inputsRow, i) => {
            return (
              <div key={i}>
                <NewLecturer
                  editValues={editValues}
                  editMode={editMode}
                  onAddNewRow={addNewRowHandler}
                  onRemoveRow={removeRowHandler}
                  modalFor={modalFor}
                  onChange={inputsChangeHandler}
                  index={i}
                  lecturerData={lecturerData}
                  values={inputsState[i]}
                  count={inputsState.length}
                />
              </div>
            );
          })}
        {modalFor === "courses" &&
          inputsState.map((inputsRow, i) => {
            return (
              <div key={i}>
                <NewCourse
                  editValues={editValues}
                  editMode={editMode}
                  onAddNewRow={addNewRowHandler}
                  onRemoveRow={removeRowHandler}
                  modalFor={modalFor}
                  onChange={inputsChangeHandler}
                  index={i}
                  courseData={courseData}
                  values={inputsState[i]}
                  count={inputsState.length}
                />
              </div>
            );
          })}
        {modalFor === "rooms" &&
          inputsState.map((inputsRow, i) => {
            return (
              <div key={i}>
                <NewRoom
                  editValues={editValues}
                  editMode={editMode}
                  onAddNewRow={addNewRowHandler}
                  onRemoveRow={removeRowHandler}
                  modalFor={modalFor}
                  onChange={inputsChangeHandler}
                  index={i}
                  roomsData={roomsData}
                  values={inputsState[i]}
                  count={inputsState.length}
                />
              </div>
            );
          })}

        <div
          className={`flex ${
            editMode
              ? "justify-between space-x-20"
              : "justify-center lg:justify-between"
          } w-full pt-8`}
        >
          <div className="relative">
            {showDeleteConfirmModal && (
              <div className="absolute top-20 -left-16">
                <ConfirmModal
                  onDecline={declineHandler}
                  onConfirm={deleteItemHandler}
                  modalMessage={deleteModalMessage}
                  topArrow={true}
                />
              </div>
            )}
            {editMode && (
              <button
                onClick={confirmModalHandler}
                className="btn-actions"
                type="button"
                name="delete"
              >
                KUSTUTA
              </button>
            )}
          </div>
          <div className="relative">
            {!validSubmit && (
              <div className="absolute -top-16 -left-10 w-[150%]">
                <TooltipLarge message={mandatoryFields} />
              </div>
            )}

            <button
              onClick={confirmModalHandler}
              className="btn-actions"
              type="submit"
              name={editMode ? "update" : "create"}
            >
              SALVESTA
            </button>

            {validSubmit && showUpdateConfirmModal && (
              <div className="absolute top-20 -left-16">
                <ConfirmModal
                  onDecline={declineUpdateHandler}
                  onConfirm={editMode ? updateItemHandler : submitItemHandler}
                  modalMessage={saveMessage}
                  topArrow={true}
                />
              </div>
            )}
          </div>
        </div>
        {showRequestModal && (
          <RequestModal
            error={requestError}
            success={requestSuccess}
            loading={requestLoading}
            modalMessage={requestMessage}
            customStyle="top-1/2 lg:ml-32"
            onDecline={endRequestHandler}
            onConfirm={failedRequestConfirmHandler}
          />
        )}
      </div>
    </Modal>
  );
};

export default AddNewItem;
