import * as React from "react";
import { FieldWrapper } from "@progress/kendo-react-form";
import {
  Input,
  MaskedTextBox,
  NumericTextBox,
  Checkbox,
  ColorPicker,
  Switch,
  RadioGroup,
  Slider,
  SliderLabel,
  RangeSlider,
  TextArea,
  Rating,
} from "@progress/kendo-react-inputs";
import {
  DatePicker,
  TimePicker,
  DateTimePicker,
  DateRangePicker,
  DateInput,
} from "@progress/kendo-react-dateinputs";
import {
  Label,
  Error,
  Hint,
  FloatingLabel,
} from "@progress/kendo-react-labels";
import { Upload } from "@progress/kendo-react-upload";
import {
  DropDownList,
  AutoComplete,
  MultiSelect,
  ComboBox,
  MultiColumnComboBox,
  DropDownTree,
} from "@progress/kendo-react-dropdowns";
import { processTreeData, expandedState } from "./tree-data-operations";
import { GridCell } from "@progress/kendo-react-grid";
import { alphaNumericWithSpaceValidator } from "./validators";

export const FormInputWithClose = (fieldRenderProps) => {
  const {
    validationMessage,
    touched,
    label,
    id,
    valid,
    disabled,
    hint,
    type,
    optional,
    wrapperstyle,
    value,
    onInputClick,
    onRemoveValue,
    ...others
  } = fieldRenderProps;

  const showValidationMessage = touched && validationMessage;
  const showHint = !showValidationMessage && hint;
  const hintId = showHint ? `${id}_hint` : "";
  const errorId = showValidationMessage ? `${id}_error` : "";
  return (
    <FieldWrapper style={wrapperstyle}>
      {label && (
        <Label
          editorId={id}
          editorValid={valid}
          editorDisabled={disabled}
          optional={optional}
        >
          {label}
        </Label>
      )}
      <div className={"k-form-field-wrap"}>
        <div className="d-flex align-items-center border rounded-2 overflow-hidden bg-white">
          <Input
            valid={valid}
            type={type}
            id={id}
            disabled={disabled}
            ariaDescribedBy={`${hintId} ${errorId}`}
            value={value}
            {...others}
            style={{
              border: "none",
              borderRadius: "0px",
              boxShadow: "none",
            }}
            onClick={onInputClick}
          />
          {value && (
            <div
              style={{ padding: "0px 7px", cursor: "pointer" }}
              onClick={onRemoveValue}
            >
              <i className="fa-solid fa-close" style={{ color: "#999fa9" }}></i>
            </div>
          )}
        </div>

        {showHint && <Hint id={hintId}>{hint}</Hint>}
        {showValidationMessage && (
          <Error id={errorId}>{validationMessage}</Error>
        )}
      </div>
    </FieldWrapper>
  );
};

export const FormInput = (fieldRenderProps) => {
  const {
    validationMessage,
    touched,
    label,
    id,
    valid,
    disabled,
    hint,
    type,
    optional,
    wrapperstyle,
    ...others
  } = fieldRenderProps;
  const showValidationMessage = touched && validationMessage;
  const showHint = !showValidationMessage && hint;
  const hintId = showHint ? `${id}_hint` : "";
  const errorId = showValidationMessage ? `${id}_error` : "";
  return (
    <FieldWrapper style={wrapperstyle}>
      {label && (
        <Label
          editorId={id}
          editorValid={valid}
          editorDisabled={disabled}
          optional={optional}
        >
          {label}
        </Label>
      )}
      <div className={"k-form-field-wrap"}>
        <Input
          valid={valid}
          type={type}
          id={id}
          disabled={disabled}
          ariaDescribedBy={`${hintId} ${errorId}`}
          {...others}
        />

        {showHint && <Hint id={hintId}>{hint}</Hint>}
        {showValidationMessage && (
          <Error id={errorId}>{validationMessage}</Error>
        )}
      </div>
    </FieldWrapper>
  );
};

export const DescriptionCell100 = (props) => {
  return (
    <ColumnFormInput {...props} maxlength={100} />
  )
}

export const ColumnFormInput = (props) => {
  const { inEdit } = props.dataItem;
  const handleChange = (e) => {
    if (props.onChange) {
      if (!alphaNumericWithSpaceValidator(e.target.value)) {
        props.onChange({
          ...e,
          ...props,
          value: e.target.value,
        });
      }
    }
  };
  if (inEdit) {
    return (
      <td>
        <FormInput
          {...props}
          value={props.dataItem[props.field]}
          onChange={handleChange}
          validator={alphaNumericWithSpaceValidator}
          maxlength={props.maxlength}
        />
      </td>
    );
  } else {
    return <GridCell {...props} />;
  }
};

export const ColumnFormNumberInputForDecimal = (props) => {
  const { inEdit } = props.dataItem;
  let decimalPattern = /^$|^\d+(\.\d{0,4})?$/;
  const handleChange = (e) => {
    if (props.onChange) {
      props.onChange({
        ...e,
        ...props,
        value: decimalPattern.test(e.target.value)
          ? e.target.value
          : props.dataItem[props.field],
      });
    }
  };
  if (inEdit) {
    return (
      <td>
        <FormInput
          {...props}
          value={props.dataItem[props.field]}
          onChange={handleChange}
        />
      </td>
    );
  } else {
    return <GridCell {...props} />;
  }
};

export const radioData = [
  {
    label: "Yes",
    value: true,
  },
  {
    label: "No",
    value: false,
  },
];

export const FormRadioGroup = (fieldRenderProps) => {
  const {
    validationMessage,
    touched,
    id,
    label,
    valid,
    disabled,
    hint,
    visited,
    modified,
    ...others
  } = fieldRenderProps;
  const editorRef = React.useRef(null);
  const showValidationMessage = touched && validationMessage;
  const showHint = !showValidationMessage && hint;
  const hintId = showHint ? `${id}_hint` : "";
  const errorId = showValidationMessage ? `${id}_error` : "";
  const labelId = label ? `${id}_label` : "";
  return (
    <FieldWrapper>
      <Label
        id={labelId}
        editorRef={editorRef}
        editorId={id}
        editorValid={valid}
        editorDisabled={disabled}
      >
        {label}
      </Label>
      <RadioGroup
        ariaDescribedBy={`${hintId} ${errorId}`}
        ariaLabelledBy={labelId}
        valid={valid}
        disabled={disabled}
        ref={editorRef}
        {...others}
      />
      {showHint && <Hint id={hintId}>{hint}</Hint>}
      {showValidationMessage && <Error id={errorId}>{validationMessage}</Error>}
    </FieldWrapper>
  );
};

export const FormNumericTextBox = (fieldRenderProps) => {
  const {
    validationMessage,
    touched,
    label,
    id,
    valid,
    wrapperstyle,
    disabled,
    hint,
    onChange,
    ...others
  } = fieldRenderProps;
  const showValidationMessage = touched && validationMessage;
  const showHint = !showValidationMessage && hint;
  const hintId = showHint ? `${id}_hint` : "";
  const errorId = showValidationMessage ? `${id}_error` : "";
  const numericRef = React.useRef(null);

  const handleFocus = () => {
    if (numericRef.current && numericRef.current.element) {
      numericRef.current.element.select();
    }
  };
  return (
    <FieldWrapper style={wrapperstyle}>
      {label && (
        <Label editorId={id} editorValid={valid} editorDisabled={disabled}>
          {label}
        </Label>
      )}
      <NumericTextBox
        ref={numericRef}
        ariaDescribedBy={`${hintId} ${errorId}`}
        valid={valid}
        id={id}
        disabled={disabled}
        {...others}
        onFocus={handleFocus}
        onChange={onChange}
      />
      {showHint && <Hint id={hintId}>{hint}</Hint>}
      {showValidationMessage && <Error id={errorId}>{validationMessage}</Error>}
    </FieldWrapper>
  );
};


export const ColumnFormNumericTextBoxForNonGrouping = (props) => {
  const { inEdit, allowNagative, } = props.dataItem;
  const minValue = allowNagative ? "-10000" : 0;
  const handleChange = (e) => {
    if (props.onChange) {
      props.onChange({
        ...e,
        ...props,
        value: e.value,
      });
    }
  };
  if (inEdit) {
    return (
      <td>
        <FormNumericTextBox
          {...props}
          spinners={false}
          min={minValue}
          step={0.00001}
          decimals={5}
          format={{ style: "decimal", maximumFractionDigits: 5, useGrouping: false }}
          value={props.dataItem[props.field]}
          onChange={handleChange}
        />
      </td>
    );
  } else {
    return <td> {props.dataItem[props.field]}</td>;
  }
};

export const ColumnFormNumericTextBox = (props) => {
  const { inEdit, allowNagative, } = props.dataItem;
  const { useGrouping = true } = props
  const minValue = allowNagative ? "-10000" : 0;
  const handleChange = (e) => {
    if (props.onChange) {
      props.onChange({
        ...e,
        ...props,
        value: e.value,
      });
    }
  };
  if (inEdit) {
    return (
      <td>
        <FormNumericTextBox
          {...props}
          spinners={false}
          min={minValue}
          step={0.00001}
          decimals={5}
          format={{ style: "decimal", maximumFractionDigits: 5, useGrouping }}
          value={props.dataItem[props.field]}
          onChange={handleChange}
        />
      </td>
    );
  } else {
    return <td> {props.dataItem[props.field]}</td>;
  }
};


export const ColumnFormIntegerTextBox = (props) => {
  const { inEdit } = props.dataItem;
  const handleChange = (e) => {
    if (props.onChange) {
      props.onChange({
        ...e,
        ...props,
        value: e.value,
      });
    }
  };
  if (inEdit) {
    return (
      <td>
        <FormNumericTextBox
          {...props}
          format={"#"}
          min={0}
          decimals={0}
          step={1}
          spinners={false}
          useGrouping={false}
          value={props.dataItem[props.field]}
          onChange={handleChange}
        />
      </td>
    );
  } else {
    return <td> {props.dataItem[props.field]}</td>;
  }
};


export const ColumnFormCurrencyTextBox = (props) => {
  const { inEdit } = props.dataItem;
  const handleChange = (e) => {
    if (props.onChange) {
      props.onChange({
        ...e,
        ...props,
        value: e.target.value,
      });
    }
  };
  if (inEdit) {
    return (
      <td>
        <FormNumericTextBox
          {...props}
          spinners={false}
          format={"c2"}
          min={0}
          step={1}
          value={props.dataItem[props.field]}
          onChange={handleChange}
          className="!k-text-right"
        />
      </td>
    );
  } else {
    return <GridCell {...props} className="!k-text-right" />;
  }
};
export const ColumnFormNegativeCurrencyTextBox = (props) => {
  const { inEdit } = props.dataItem;
  const handleChange = (e) => {
    if (props.onChange) {
      props.onChange({
        ...e,
        ...props,
        value: e.target.value,
      });
    }
  };
  if (inEdit) {
    return (
      <td>
        <FormNumericTextBox
          {...props}
          spinners={false}
          format={"c2"}
          step={1}
          value={props.dataItem[props.field]}
          onChange={handleChange}
          className="!k-text-right"
        />
      </td>
    );
  } else {
    return <GridCell {...props} className="!k-text-right" />;
  }
};

export const ColumnFormCurrencyTextBoxAmountNonEdit = (props) => {
  const { inEdit, amountEdit, type, amount, allowNagative } = props.dataItem;
  const minValue = allowNagative ? "-10000" : 0;
  const handleChange = (e) => {
    if (props.onChange) {
      props.onChange({
        ...e,
        ...props,
        value: e.target.value,
      });
    }
  };

  const handleChangeAmount = (e) => {
    if (props.onChange) {
      props.onChange({
        ...e,
        ...props,
        value: e.target.value,
      });
    }
  }

  if (inEdit && !amountEdit) {
    return <GridCell {...props} className="!k-text-right" />;
  }
  else if (inEdit && amountEdit) {
    return (<td>
      <FormNumericTextBox
        {...props}
        spinners={false}
        format={"c2"}
        min={minValue}
        step={1}
        value={amount}
        onChange={handleChangeAmount}
        className="!k-text-left"
      />
    </td>)
  }
  else if (inEdit) {
    return (
      <td>
        <FormNumericTextBox
          {...props}
          spinners={false}
          format={"c2"}
          min={0}
          step={1}
          value={props.dataItem[props.field]}
          onChange={handleChange}
          className="!k-text-right"
        />
      </td>
    );
  } else {
    return <GridCell {...props} className="!k-text-right" />;
  }
};

export const FormCheckbox = (fieldRenderProps) => {
  const {
    validationMessage,
    touched,
    id,
    valid,
    disabled,
    hint,
    optional,
    label,
    visited,
    modified,
    ...others
  } = fieldRenderProps;
  const showValidationMessage = touched && validationMessage;
  const showHint = !showValidationMessage && hint;
  const hintId = showHint ? `${id}_hint` : "";
  const errorId = showValidationMessage ? `${id}_error` : "";
  return (
    <FieldWrapper>
      <Checkbox
        ariaDescribedBy={`${hintId} ${errorId}`}
        label={label}
        labelOptional={optional}
        valid={valid}
        id={id}
        disabled={disabled}
        {...others}
      />
      {showHint && <Hint id={hintId}>{hint}</Hint>}
      {showValidationMessage && <Error id={errorId}>{validationMessage}</Error>}
    </FieldWrapper>
  );
};
export const FormSwitch = (fieldRenderProps) => {
  const {
    validationMessage,
    touched,
    label,
    optional,
    id,
    valid,
    disabled,
    hint,
    ...others
  } = fieldRenderProps;
  const editorRef = React.useRef(null);
  const showValidationMessage = touched && validationMessage;
  const showHint = !showValidationMessage && hint;
  const hintId = showHint ? `${id}_hint` : "";
  const errorId = showValidationMessage ? `${id}_error` : "";
  const labelId = label ? `${id}_label` : "";
  return (
    <FieldWrapper>
      <Label
        id={labelId}
        editorRef={editorRef}
        editorId={id}
        editorValid={valid}
        editorDisabled={disabled}
        optional={optional}
      >
        {label}
      </Label>
      <Switch
        ref={editorRef}
        ariaLabelledBy={labelId}
        ariaDescribedBy={`${hintId} ${errorId}`}
        valid={valid}
        id={id}
        disabled={disabled}
        {...others}
      />
      {showHint && <Hint id={hintId}>{hint}</Hint>}
      {showValidationMessage && <Error id={errorId}>{validationMessage}</Error>}
    </FieldWrapper>
  );
};
export const FormMaskedTextBox = (fieldRenderProps) => {
  const {
    validationMessage,
    touched,
    label,
    id,
    valid,
    hint,
    optional,
    ...others
  } = fieldRenderProps;
  const showValidationMessage = touched && validationMessage;
  const showHint = !showValidationMessage && hint;
  const hintId = showHint ? `${id}_hint` : "";
  const errorId = showValidationMessage ? `${id}_error` : "";
  return (
    <FieldWrapper>
      <Label editorId={id} editorValid={valid} optional={optional}>
        {label}
      </Label>
      <div className={"k-form-field-wrap"}>
        <MaskedTextBox
          ariaDescribedBy={`${hintId} ${errorId}`}
          valid={valid}
          id={id}
          {...others}
        />
        {showHint && <Hint id={hintId}>{hint}</Hint>}
        {showValidationMessage && (
          <Error id={errorId}>{validationMessage}</Error>
        )}
      </div>
    </FieldWrapper>
  );
};

export const ColumnFormTextArea = (props) => {
  const { inEdit } = props.dataItem;
  const handleChange = (e) => {
    if (props.onChange) {
      if (!alphaNumericWithSpaceValidator(e.target.value)) {
        props.onChange({
          ...e,
          ...props,
          value: e.target.value,
        });
      }
    }
  };
  if (inEdit) {
    return (
      <td>
        <FormTextArea
          {...props}
          value={props.dataItem[props.field]}
          onChange={handleChange}
          validator={alphaNumericWithSpaceValidator}
        />
      </td>
    );
  } else {
    return <GridCell {...props} />;
  }
};

export const FormTextArea = (fieldRenderProps) => {
  const ref = React.useRef(null);
  const {
    validationMessage,
    touched,
    label,
    id,
    valid,
    hint,
    disabled,
    optional,
    wrapperstyle,
    autoFocus = false,
    ...others
  } = fieldRenderProps;
  const showValidationMessage = touched && validationMessage;
  const showHint = !showValidationMessage && hint;
  const hintId = showHint ? `${id}_hint` : "";
  const errorId = showValidationMessage ? `${id}_error` : "";

  React.useEffect(() => {
    if (autoFocus && ref.current) {
      ref.current.focus();
    }
  }, [autoFocus]);
  return (
    <FieldWrapper style={wrapperstyle}>
      <Label editorId={id} editorValid={valid} optional={optional}>
        {label}
      </Label>
      <TextArea
        ref={ref}
        valid={valid}
        id={id}
        disabled={disabled}
        ariaDescribedBy={`${hintId} ${errorId}`}
        {...others}
      />
      {showHint && <Hint id={hintId}>{hint}</Hint>}
      {showValidationMessage && <Error id={errorId}>{validationMessage}</Error>}
    </FieldWrapper>
  );
};
export const FormColorPicker = (fieldRenderProps) => {
  const {
    validationMessage,
    touched,
    label,
    id,
    valid,
    disabled,
    hint,
    wrapperstyle,
    ...others
  } = fieldRenderProps;
  const editorRef = React.useRef(null);
  const showValidationMessage = touched && validationMessage;
  const showHint = !showValidationMessage && hint;
  const hintId = showHint ? `${id}_hint` : "";
  const errorId = showValidationMessage ? `${id}_error` : "";
  const labelId = label ? `${id}_label` : "";
  return (
    <FieldWrapper style={wrapperstyle}>
      <Label
        id={labelId}
        editorRef={editorRef}
        editorId={id}
        editorValid={valid}
        editorDisabled={disabled}
      >
        {label}
      </Label>
      <ColorPicker
        ariaLabelledBy={labelId}
        ariaDescribedBy={`${hintId} ${errorId}`}
        ref={editorRef}
        valid={valid}
        id={id}
        disabled={disabled}
        {...others}
      />
      {showHint && <Hint id={hintId}>{hint}</Hint>}
      {showValidationMessage && <Error id={errorId}>{validationMessage}</Error>}
    </FieldWrapper>
  );
};
export const FormSlider = (fieldRenderProps) => {
  const {
    validationMessage,
    touched,
    label,
    id,
    valid,
    disabled,
    hint,
    data,
    min,
    max,
    ...others
  } = fieldRenderProps;
  const editorRef = React.useRef(null);
  const showValidationMessage = touched && validationMessage;
  const showHint = !showValidationMessage && hint;
  const hintId = showHint ? `${id}_hint` : "";
  const errorId = showValidationMessage ? `${id}_error` : "";
  const labelId = label ? `${id}_label` : "";
  return (
    <FieldWrapper>
      <Label
        id={labelId}
        editorRef={editorRef}
        editorId={id}
        editorValid={valid}
        editorDisabled={disabled}
      >
        {label}
      </Label>
      <Slider
        ariaLabelledBy={labelId}
        ariaDescribedBy={`${hintId} ${errorId}`}
        ref={editorRef}
        valid={valid}
        id={id}
        disabled={disabled}
        min={min}
        max={max}
        {...others}
      >
        {data.map((value) => (
          <SliderLabel title={value} key={value} position={value}>
            {value.toString()}
          </SliderLabel>
        ))}
      </Slider>
      {showHint && <Hint id={hintId}>{hint}</Hint>}
      {showValidationMessage && <Error id={errorId}>{validationMessage}</Error>}
    </FieldWrapper>
  );
};
export const FormRangeSlider = (fieldRenderProps) => {
  const {
    validationMessage,
    touched,
    label,
    id,
    valid,
    hint,
    disabled,
    data,
    min,
    max,
    ...others
  } = fieldRenderProps;
  const showValidationMessage = touched && validationMessage;
  const showHint = !showValidationMessage && hint;
  const hintId = showHint ? `${id}_hint` : "";
  const errorId = showValidationMessage ? `${id}_error` : "";
  return (
    <FieldWrapper>
      <Label editorId={id} editorValid={valid}>
        {label}
      </Label>
      <RangeSlider
        valid={valid}
        id={id}
        disabled={disabled}
        ariaDescribedBy={`${hintId} ${errorId}`}
        min={min}
        max={max}
        {...others}
      >
        {data.map((value) => {
          return (
            <SliderLabel key={value} position={value}>
              {value.toString()}
            </SliderLabel>
          );
        })}
      </RangeSlider>
      {showValidationMessage && <Error id={errorId}>{validationMessage}</Error>}
    </FieldWrapper>
  );
};
export const FormRating = (fieldRenderProps) => {
  const {
    validationMessage,
    touched,
    label,
    id,
    valid,
    hint,
    disabled,
    optional,
    ...others
  } = fieldRenderProps;
  const showValidationMessage = touched && validationMessage;
  const showHint = !showValidationMessage && hint;
  const hintId = showHint ? `${id}_hint` : "";
  const errorId = showValidationMessage ? `${id}_error` : "";
  return (
    <FieldWrapper>
      <Label editorId={id} editorValid={valid} optional={optional}>
        {label}
      </Label>
      <Rating
        valid={valid}
        id={id}
        disabled={disabled}
        ariaDescribedBy={`${hintId} ${errorId}`}
        {...others}
      />
      {showValidationMessage && <Error id={errorId}>{validationMessage}</Error>}
    </FieldWrapper>
  );
};
export const FormUpload = (fieldRenderProps) => {
  const {
    value,
    id,
    optional,
    label,
    hint,
    validationMessage,
    touched,
    ...others
  } = fieldRenderProps;
  const showValidationMessage = touched && validationMessage;
  const showHint = !showValidationMessage && hint;
  const hintId = showHint ? `${id}_hint` : "";
  const errorId = showValidationMessage ? `${id}_error` : "";
  const labelId = label ? `${id}_label` : "";
  const onChangeHandler = (event) => {
    fieldRenderProps.onChange({
      value: event.newState,
    });
  };
  const onRemoveHandler = (event) => {
    fieldRenderProps.onChange({
      value: event.newState,
    });
  };
  return (
    <FieldWrapper>
      <Label id={labelId} editorId={id} optional={optional}>
        {label}
      </Label>
      <Upload
        id={id}
        autoUpload={false}
        showActionButtons={false}
        multiple={false}
        files={value}
        onAdd={onChangeHandler}
        onRemove={onRemoveHandler}
        ariaDescribedBy={`${hintId} ${errorId}`}
        ariaLabelledBy={labelId}
        {...others}
      />
      {showHint && <Hint id={hintId}>{hint}</Hint>}
      {showValidationMessage && <Error id={errorId}>{validationMessage}</Error>}
    </FieldWrapper>
  );
};
export const FormDropDownList = (fieldRenderProps) => {
  const {
    validationMessage,
    touched,
    label,
    id,
    valid,
    disabled,
    hint,
    wrapperstyle,
    ...others
  } = fieldRenderProps;
  const editorRef = React.useRef(null);
  const showValidationMessage = touched && validationMessage;
  const showHint = !showValidationMessage && hint;
  const hintId = showHint ? `${id}_hint` : "";
  const errorId = showValidationMessage ? `${id}_error` : "";
  const labelId = label ? `${id}_label` : "";

  return (
    <FieldWrapper style={wrapperstyle}>
      <Label
        id={labelId}
        editorRef={editorRef}
        editorId={id}
        editorValid={valid}
        editorDisabled={disabled}
      >
        {label}
      </Label>
      <DropDownList
        ariaLabelledBy={labelId}
        ariaDescribedBy={`${hintId} ${errorId}`}
        ref={editorRef}
        valid={valid}
        id={id}
        disabled={disabled}
        {...others}
        data={
          others.data?.textField
            ? others.data.sort((a, b) => {
              const isANumber = /^\d/.test(a[others.textField]);
              const isBNumber = /^\d/.test(b[others.textField]);

              if (isANumber && !isBNumber) return -1;
              if (!isANumber && isBNumber) return 1;

              return a[others.textField].localeCompare(b[others.textField]);
            })
            : others.data
        }
      />
      {showHint && <Hint id={hintId}>{hint}</Hint>}
      {showValidationMessage && <Error id={errorId}>{validationMessage}</Error>}
    </FieldWrapper>
  );
};
export const FormAutoComplete = (fieldRenderProps) => {
  const {
    validationMessage,
    touched,
    label,
    id,
    valid,
    disabled,
    hint,
    wrapperstyle,
    ...others
  } = fieldRenderProps;
  const editorRef = React.useRef(null);
  const showValidationMessage = touched && validationMessage;
  const showHint = !showValidationMessage && hint;
  const hintId = showHint ? `${id}_hint` : "";
  const errorId = showValidationMessage ? `${id}_error` : "";
  const labelId = label ? `${id}_label` : "";
  return (
    <FieldWrapper style={wrapperstyle}>
      <Label
        id={labelId}
        editorRef={editorRef}
        editorId={id}
        editorValid={valid}
        editorDisabled={disabled}
      >
        {label}
      </Label>
      <AutoComplete
        ariaLabelledBy={labelId}
        ariaDescribedBy={`${hintId} ${errorId}`}
        ref={editorRef}
        valid={valid}
        id={id}
        disabled={disabled}
        {...others}
        data={others.data.sort((a, b) => {
          const isANumber = /^\d/.test(a[others.textField]);
          const isBNumber = /^\d/.test(b[others.textField]);

          if (isANumber && !isBNumber) return -1;
          if (!isANumber && isBNumber) return 1;

          return a[others.textField].localeCompare(b[others.textField]);
        })}
      />
      {showHint && <Hint id={hintId}>{hint}</Hint>}
      {showValidationMessage && <Error id={errorId}>{validationMessage}</Error>}
    </FieldWrapper>
  );
};
export const FormComboBox = (fieldRenderProps) => {
  const {
    validationMessage,
    touched,
    label,
    id,
    valid,
    disabled,
    hint,
    wrapperstyle,
    ...others
  } = fieldRenderProps;
  const editorRef = React.useRef(null);
  const showValidationMessage = touched && validationMessage;
  const showHint = !showValidationMessage && hint;
  const hintId = showHint ? `${id}_hint` : "";
  const errorId = showValidationMessage ? `${id}_error` : "";
  const labelId = label ? `${id}_label` : "";
  return (
    <FieldWrapper style={wrapperstyle}>
      <Label
        id={labelId}
        editorRef={editorRef}
        editorId={id}
        editorValid={valid}
        editorDisabled={disabled}
      >
        {label}
      </Label>
      <ComboBox
        ariaLabelledBy={labelId}
        ariaDescribedBy={`${hintId} ${errorId}`}
        ref={editorRef}
        valid={valid}
        id={id}
        disabled={disabled}
        {...others}
      />
      {showHint && <Hint id={hintId}>{hint}</Hint>}
      {showValidationMessage && <Error id={errorId}>{validationMessage}</Error>}
    </FieldWrapper>
  );
};
export const FormMultiColumnComboBox = (fieldRenderProps) => {
  const {
    validationMessage,
    touched,
    label,
    id,
    valid,
    disabled,
    hint,
    wrapperstyle,
    ...others
  } = fieldRenderProps;
  const editorRef = React.useRef(null);
  const showValidationMessage = touched && validationMessage;
  const showHint = !showValidationMessage && hint;
  const hintId = showHint ? `${id}_hint` : "";
  const errorId = showValidationMessage ? `${id}_error` : "";
  const labelId = label ? `${id}_label` : "";
  const columns = [
    {
      field: "id",
      header: <span>header</span>,
      width: "100px",
    },
    {
      field: "name",
      header: "Name",
      width: "300px",
    },
    {
      field: "position",
      header: "Position",
      width: "300px",
    },
  ];
  return (
    <FieldWrapper style={wrapperstyle}>
      <Label
        id={labelId}
        editorRef={editorRef}
        editorId={id}
        editorValid={valid}
        editorDisabled={disabled}
      >
        {label}
      </Label>
      <MultiColumnComboBox
        ariaLabelledBy={labelId}
        ariaDescribedBy={`${hintId} ${errorId}`}
        ref={editorRef}
        valid={valid}
        id={id}
        disabled={disabled}
        columns={columns}
        textField={"name"}
        {...others}
        data={others.data.sort((a, b) => {
          const isANumber = /^\d/.test(a[others.textField]);
          const isBNumber = /^\d/.test(b[others.textField]);

          if (isANumber && !isBNumber) return -1;
          if (!isANumber && isBNumber) return 1;

          return a[others.textField].localeCompare(b[others.textField]);
        })}
      />
      {showHint && <Hint id={hintId}>{hint}</Hint>}
      {showValidationMessage && <Error id={errorId}>{validationMessage}</Error>}
    </FieldWrapper>
  );
};
export const FormMultiSelect = (fieldRenderProps) => {
  const {
    validationMessage,
    touched,
    label,
    id,
    valid,
    disabled,
    hint,
    wrapperstyle,
    ...others
  } = fieldRenderProps;
  const editorRef = React.useRef(null);
  const showValidationMessage = touched && validationMessage;
  const showHint = !showValidationMessage && hint;
  const hintId = showHint ? `${id}_hint` : "";
  const errorId = showValidationMessage ? `${id}_error` : "";
  const labelId = label ? `${id}_label` : "";
  return (
    <FieldWrapper style={wrapperstyle}>
      <Label
        id={labelId}
        editorRef={editorRef}
        editorId={id}
        editorValid={valid}
        editorDisabled={disabled}
      >
        {label}
      </Label>
      <MultiSelect
        ariaLabelledBy={labelId}
        ariaDescribedBy={`${hintId} ${errorId}`}
        ref={editorRef}
        valid={valid}
        id={id}
        disabled={disabled}
        {...others}
      />
      {showHint && <Hint id={hintId}>{hint}</Hint>}
      {showValidationMessage && <Error id={errorId}>{validationMessage}</Error>}
    </FieldWrapper>
  );
};
export const FormDropDownTree = (fieldRenderProps) => {
  const {
    validationMessage,
    touched,
    label,
    id,
    valid,
    disabled,
    hint,
    wrapperstyle,
    data,
    ...others
  } = fieldRenderProps;
  const { value, selectField, expandField, dataItemKey, filter } = others;
  const [expanded, setExpanded] = React.useState([data[0][dataItemKey]]);
  const treeData = React.useMemo(
    () =>
      processTreeData(
        data,
        {
          expanded,
          value,
          filter,
        },
        {
          selectField,
          expandField,
          dataItemKey,
          subItemsField: "items",
        }
      ),
    [data, expanded, value, filter, selectField, expandField, dataItemKey]
  );
  const onExpandChange = React.useCallback(
    (event) => setExpanded(expandedState(event.item, dataItemKey, expanded)),
    [expanded, dataItemKey]
  );
  const editorRef = React.useRef(null);
  const showValidationMessage = touched && validationMessage;
  const showHint = !showValidationMessage && hint;
  const hintId = showHint ? `${id}_hint` : "";
  const errorId = showValidationMessage ? `${id}_error` : "";
  const labelId = label ? `${id}_label` : "";
  return (
    <FieldWrapper style={wrapperstyle}>
      <Label
        id={labelId}
        editorRef={editorRef}
        editorId={id}
        editorValid={valid}
        editorDisabled={disabled}
      >
        {label}
      </Label>
      <DropDownTree
        ariaLabelledBy={labelId}
        ariaDescribedBy={`${hintId} ${errorId}`}
        ref={editorRef}
        valid={valid}
        id={id}
        disabled={disabled}
        data={treeData}
        onExpandChange={onExpandChange}
        dataItemKey={others.dataItemKey}
        textField={others.textField}
        {...others}
      />
      {showHint && <Hint id={hintId}>{hint}</Hint>}
      {showValidationMessage && <Error id={errorId}>{validationMessage}</Error>}
    </FieldWrapper>
  );
};
var compareDate = "MM/DD/YYYY";
var compareTime = "HH:mm";
var compareDateTime = "MM/DD/YYYY HH:mm";

export const FormDatePicker = (fieldRenderProps) => {
  const {
    validationMessage,
    touched,
    label,
    id,
    valid,
    disabled,
    hint,
    wrapperstyle,
    hintDirection,
    startDate,
    ...others
  } = fieldRenderProps;
  const showValidationMessage = touched && validationMessage;
  const showHint = !showValidationMessage && hint;
  const hintId = showHint ? `${id}_hint` : "";
  const errorId = showValidationMessage ? `${id}_error` : "";
  const labelId = label ? `${id}_label` : "";
  const onKeyUp = (e) => {
    const value = e.target.value;
    if (value !== compareDate) {
      const month = value.split("/")[0];
      const day = value.split("/")[1];
      const year = value.split("/")[2];
      const cmpmonth = compareDate.split("/")[0];
      const cmpday = compareDate.split("/")[1];
      const cmpyear = compareDate.split("/")[2];
      var Ischange = false;
      if (year == cmpyear) {
        if (!isNaN(month) && month >= 1 && month <= 12 && month !== "01") {
          if (
            (month.slice(1) !== cmpmonth.slice(1) &&
              month.slice(-1) !== cmpmonth.slice(-1)) ||
            (cmpmonth !== month && month == "11")
          ) {
            e.target.setSelectionRange(3, 5);
            Ischange = true;
          }
        } else if (cmpmonth == "0" && month == "01") {
          e.target.setSelectionRange(3, 5);
          Ischange = true;
        }
        if (Ischange == false) {
          if (
            !isNaN(day) &&
            day >= 1 &&
            day <= 31 &&
            day !== "01" &&
            day !== "02" &&
            day !== "03"
          ) {
            if (
              (cmpday.slice(1) !== day.slice(1) &&
                cmpday.slice(-1) !== day.slice(-1)) ||
              day == "11" ||
              day == "22"
            ) {
              e.target.setSelectionRange(6, 10);
            }
          } else if (
            cmpday == "0" &&
            (day == "01" || day !== "02" || day !== "03")
          ) {
            e.target.setSelectionRange(6, 10);
          }
        }
      }
      compareDate = value;
    }
  };

  return (
    <FieldWrapper style={wrapperstyle}>
      <Label
        id={labelId}
        editorId={id}
        editorValid={valid}
        editorDisabled={disabled}
      >
        {label}
      </Label>
      <div className={"k-form-field-wrap"} onKeyUp={onKeyUp}>
        <DatePicker
          format="MM/dd/yyyy"
          formatPlaceholder={{ year: "YYYY", month: "MM", day: "DD" }}
          ariaLabelledBy={labelId}
          ariaDescribedBy={`${hintId} ${errorId}`}
          valid={valid}
          id={id}
          disabled={disabled}
          {...others}
          min={startDate}
        />
        {showHint && (
          <Hint id={hintId} direction={hintDirection}>
            {hint}
          </Hint>
        )}
        {showValidationMessage && (
          <Error id={errorId}>{validationMessage}</Error>
        )}
      </div>
    </FieldWrapper>
  );
};

export const ColumnDatePicker = (fieldRenderProps) => {
  const {
    validationMessage,
    touched,
    label,
    id,
    valid,
    disabled,
    hint,
    wrapperstyle,
    hintDirection,
    startDate,
    ...others
  } = fieldRenderProps;
  const showValidationMessage = touched && validationMessage;
  const showHint = !showValidationMessage && hint;
  const hintId = showHint ? `${id}_hint` : "";
  const errorId = showValidationMessage ? `${id}_error` : "";
  const labelId = label ? `${id}_label` : "";

  const onKeyUp = (e) => {
    const value = e.target.value;
    if (value !== compareDate) {
      const month = value.split("/")[0];
      const day = value.split("/")[1];
      const year = value.split("/")[2];
      const cmpmonth = compareDate.split("/")[0];
      const cmpday = compareDate.split("/")[1];
      const cmpyear = compareDate.split("/")[2];
      var Ischange = false;
      if (year == cmpyear) {
        if (!isNaN(month) && month >= 1 && month <= 12 && month !== "01") {
          if (
            (month.slice(1) !== cmpmonth.slice(1) &&
              month.slice(-1) !== cmpmonth.slice(-1)) ||
            (cmpmonth !== month && month == "11")
          ) {
            e.target.setSelectionRange(3, 5);
            Ischange = true;
          }
        } else if (cmpmonth == "0" && month == "01") {
          e.target.setSelectionRange(3, 5);
          Ischange = true;
        }
        if (Ischange == false) {
          if (
            !isNaN(day) &&
            day >= 1 &&
            day <= 31 &&
            day !== "01" &&
            day !== "02" &&
            day !== "03"
          ) {
            if (
              (cmpday.slice(1) !== day.slice(1) &&
                cmpday.slice(-1) !== day.slice(-1)) ||
              day == "11" ||
              day == "22"
            ) {
              e.target.setSelectionRange(6, 10);
            }
          } else if (
            cmpday == "0" &&
            (day == "01" || day !== "02" || day !== "03")
          ) {
            e.target.setSelectionRange(6, 10);
          }
        }
      }
      compareDate = value;
    }
  };

  return (
    <FieldWrapper
      style={{
        ...wrapperstyle,
        display: "flex",
      }}
    >
      <Label
        id={labelId}
        editorId={id}
        editorValid={valid}
        editorDisabled={disabled}
      >
        {label}
      </Label>

      <div className={"k-form-field-wrap"} onKeyUp={onKeyUp}>
        <DatePicker
          format="MM/dd/yyyy"
          formatPlaceholder={{ year: "YYYY", month: "MM", day: "DD" }}
          ariaLabelledBy={labelId}
          ariaDescribedBy={`${hintId} ${errorId}`}
          valid={valid}
          id={id}
          disabled={disabled}
          {...others}
          min={startDate}
        />
        {showHint && (
          <Hint id={hintId} direction={hintDirection}>
            {hint}
          </Hint>
        )}
        {showValidationMessage && (
          <Error id={errorId}>{validationMessage}</Error>
        )}
      </div>
      <button
        title="Clear"
        type="button"
        class="k-button k-button-md k-button-solid k-button-solid-base k-rounded-md k-icon-button k-ml-1"
        disabled={!fieldRenderProps.value}
        onClick={(e) => {
          e.preventDefault()
          fieldRenderProps.onChange({
            value: null,
            operator: '',
            syntheticEvent: e
          })
        }}
      >
        <span class="k-icon k-svg-icon k-svg-i-filter-clear k-button-icon">
          <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <path d="m143.5 64 168.2 168.2L288 256v160l-64 64V256L64 96V64h79.5zm236.1 100.4L448 96V64H279.3l-64-64L192 22l298 298 22-23.3-132.4-132.3z">
            </path>
          </svg>
        </span>
      </button>
    </FieldWrapper>
  )
}

export const FormDateTimePicker = (fieldRenderProps) => {
  const {
    validationMessage,
    touched,
    label,
    id,
    valid,
    disabled,
    hint,
    wrapperstyle,
    startDate,
    ...others
  } = fieldRenderProps;
  const showValidationMessage = touched && validationMessage;
  const showHint = !showValidationMessage && hint;
  const hintId = showHint ? `${id}_hint` : "";
  const errorId = showValidationMessage ? `${id}_error` : "";
  const labelId = label ? `${id}_label` : "";
  const onKeyUp = (e) => {
    var Ischange = false;
    const tval = e.target.value;
    const FullDate = tval.substring(0, tval.lastIndexOf(" "));

    if (FullDate !== compareDateTime) {
      var value = FullDate.split(" ")[0];
      const month = value.split("/")[0];
      const day = value.split("/")[1];
      const year = value.split("/")[2];
      const cmpmonth = compareDateTime.split("/")[0];
      const cmpday = compareDateTime.split("/")[1];
      const cmpyear = compareDateTime.split("/")[2].split(" ")[0];
      const fval = FullDate.split(" ")[1].split(" ")[0];
      const hour = fval.split(":")[0];
      const min = fval.split(":")[1];
      var fcompareTime = compareDateTime.split("/")[2].split(" ")[1];
      const cmphour = fcompareTime.split(":")[0];
      const cmpmin = fcompareTime.split(":")[1];

      if (month !== cmpmonth) {
        if (!isNaN(month) && month >= 1 && month <= 12 && month !== "01") {
          if (
            (month.slice(1) !== cmpmonth.slice(1) &&
              month.slice(-1) !== cmpmonth.slice(-1)) ||
            (cmpmonth !== month && month == "11")
          ) {
            e.target.setSelectionRange(3, 5);
            Ischange = true;
          }
        } else if (cmpmonth == "0" && month == "01") {
          e.target.setSelectionRange(3, 5);
          Ischange = true;
        }
      }
      if (day !== cmpday && Ischange == false) {
        if (
          !isNaN(day) &&
          day >= 1 &&
          day <= 31 &&
          day !== "01" &&
          day !== "02" &&
          day !== "03"
        ) {
          if (
            (cmpday.slice(1) !== day.slice(1) &&
              cmpday.slice(-1) !== day.slice(-1)) ||
            day == "11" ||
            day == "22"
          ) {
            e.target.setSelectionRange(6, 10);
            Ischange = true;
          }
        } else if (
          cmpday == "0" &&
          (day == "01" || day !== "02" || day !== "03")
        ) {
          e.target.setSelectionRange(6, 10);
          Ischange = true;
        }
      }
      if (year !== cmpyear && year > 999 && Ischange == false) {
        e.target.setSelectionRange(11, 13);
        Ischange = true;
      }
      if (hour !== cmphour && Ischange == false) {
        if (!isNaN(hour) && hour >= 1 && hour <= 12 && hour !== "01") {
          e.target.setSelectionRange(14, 16);
          Ischange = true;
        }
      }
      if (min !== cmpmin && Ischange == false) {
        if (
          (!isNaN(min) && min >= 1 && min <= 59 && min.charAt(0) !== "0") ||
          (min.charAt(0) == "0" && parseInt(min.charAt(1)) > 5)
        ) {
          e.target.setSelectionRange(17, 19);
        } else if (
          cmpmin == "00" &&
          min.charAt(0) == "0" &&
          parseInt(min.charAt(1)) >= 1
        ) {
          e.target.setSelectionRange(17, 19);
        }
      }
    }
    compareDateTime = FullDate;
  };
  return (
    <FieldWrapper style={wrapperstyle}>
      <Label
        id={labelId}
        editorId={id}
        editorValid={valid}
        editorDisabled={disabled}
      >
        {label}
      </Label>
      <div onKeyUp={onKeyUp}>
        <DateTimePicker
          format="MM/dd/yyyy hh:mm a"
          formatPlaceholder={{
            year: "YYYY",
            month: "MM",
            day: "DD",
            hour: "hh",
            minute: "mm",
          }}
          ariaLabelledBy={labelId}
          ariaDescribedBy={`${hintId} ${errorId}`}
          valid={valid}
          id={id}
          disabled={disabled}
          {...others}
          min={startDate}
        />
        {showHint && <Hint id={hintId}>{hint}</Hint>}
        {showValidationMessage && (
          <Error id={errorId}>{validationMessage}</Error>
        )}
      </div>
    </FieldWrapper>
  );
};
export const FormTimePicker = (fieldRenderProps) => {
  const {
    validationMessage,
    touched,
    label,
    id,
    valid,
    disabled,
    hint,
    wrapperstyle,
    startTime,
    ...others
  } = fieldRenderProps;
  const showValidationMessage = touched && validationMessage;
  const showHint = !showValidationMessage && hint;
  const hintId = showHint ? `${id}_hint` : "";
  const errorId = showValidationMessage ? `${id}_error` : "";
  const labelId = label ? `${id}_label` : "";

  const onKeyUp = (e) => {
    const value = e.target.value;
    if (value && value !== compareTime) {
      const fval = value.split(" ")[0];
      const hour = fval.split(":")[0];
      const min = fval.split(":")[1];
      const cmphour = compareTime.split(":")[0];
      const cmpmin = compareTime.split(":")[1];
      var Ischange = false;
      if (hour !== cmphour) {
        if (!isNaN(hour) && hour >= 1 && hour <= 12 && hour !== "01") {
          e.target.setSelectionRange(3, 5);
          Ischange = true;
        }
      }
      if (min !== cmpmin && Ischange == false) {
        if (
          (!isNaN(min) && min >= 1 && min <= 59 && min.charAt(0) !== "0") ||
          (min.charAt(0) == "0" && parseInt(min.charAt(1)) > 5)
        ) {
          e.target.setSelectionRange(6, 8);
        } else if (
          cmpmin == "00" &&
          min.charAt(0) == "0" &&
          parseInt(min.charAt(1)) >= 1
        ) {
          e.target.setSelectionRange(6, 8);
        }
      }
      compareTime = fval;
    }
  };
  return (
    <FieldWrapper style={wrapperstyle}>
      <Label
        id={labelId}
        editorId={id}
        editorValid={valid}
        editorDisabled={disabled}
      >
        {label}
      </Label>
      <div onKeyUp={onKeyUp}>
        <TimePicker
          format="hh:mm a"
          formatPlaceholder={{ hour: "hh", minute: "mm" }}
          ariaLabelledBy={labelId}
          ariaDescribedBy={`${hintId} ${errorId}`}
          valid={valid}
          id={id}
          disabled={disabled}
          {...others}
          min={startTime}
        />
        {showHint && <Hint id={hintId}>{hint}</Hint>}
        {showValidationMessage && (
          <Error id={errorId}>{validationMessage}</Error>
        )}
      </div>
    </FieldWrapper>
  );
};
export const FormDateInput = (fieldRenderProps) => {
  const {
    validationMessage,
    touched,
    label,
    id,
    valid,
    disabled,
    hint,
    wrapperstyle,
    ...others
  } = fieldRenderProps;
  const showValidationMessage = touched && validationMessage;
  const showHint = !showValidationMessage && hint;
  const hintId = showHint ? `${id}_hint` : "";
  const errorId = showValidationMessage ? `${id}_error` : "";
  const labelId = label ? `${id}_label` : "";
  return (
    <FieldWrapper style={wrapperstyle}>
      <Label
        id={labelId}
        editorId={id}
        editorValid={valid}
        editorDisabled={disabled}
      >
        {label}
      </Label>
      <DateInput
        ariaLabelledBy={labelId}
        ariaDescribedBy={`${hintId} ${errorId}`}
        valid={valid}
        id={id}
        disabled={disabled}
        {...others}
      />
      {showHint && <Hint id={hintId}>{hint}</Hint>}
      {showValidationMessage && <Error id={errorId}>{validationMessage}</Error>}
    </FieldWrapper>
  );
};
export const FormDateRangePicker = (fieldRenderProps) => {
  const {
    validationMessage,
    touched,
    label,
    id,
    valid,
    disabled,
    hint,
    wrapperstyle,
    ...others
  } = fieldRenderProps;
  const editorRef = React.useRef(null);
  const showValidationMessage = touched && validationMessage;
  const showHint = !showValidationMessage && hint;
  const hintId = showHint ? `${id}_hint` : "";
  const errorId = showValidationMessage ? `${id}_error` : "";
  const labelId = label ? `${id}_label` : "";
  return (
    <FieldWrapper style={wrapperstyle}>
      <Label
        id={labelId}
        editorRef={editorRef}
        editorId={id}
        editorValid={valid}
        editorDisabled={disabled}
      >
        {label}
      </Label>
      <DateRangePicker
        ariaLabelledBy={labelId}
        ariaDescribedBy={`${hintId} ${errorId}`}
        ref={editorRef}
        valid={valid}
        id={id}
        disabled={disabled}
        {...others}
      />
      {showHint && <Hint id={hintId}>{hint}</Hint>}
      {showValidationMessage && <Error id={errorId}>{validationMessage}</Error>}
    </FieldWrapper>
  );
};
export const FormFloatingNumericTextBox = (fieldRenderProps) => {
  const {
    validationMessage,
    touched,
    label,
    id,
    valid,
    disabled,
    hint,
    optional,
    value,
    ...others
  } = fieldRenderProps;
  const showValidationMessage = touched && validationMessage;
  const showHint = !showValidationMessage && hint;
  const hintId = showHint ? `${id}_hint` : "";
  const errorId = showValidationMessage ? `${id}_error` : "";
  return (
    <FieldWrapper>
      <FloatingLabel
        optional={optional}
        editorValue={value}
        editorId={id}
        editorValid={valid}
        editorDisabled={disabled}
        label={label}
      >
        <NumericTextBox
          ariaDescribedBy={`${hintId} ${errorId}`}
          value={value}
          valid={valid}
          id={id}
          disabled={disabled}
          {...others}
        />
      </FloatingLabel>
      {showHint && <Hint id={hintId}>{hint}</Hint>}
      {showValidationMessage && <Error id={errorId}>{validationMessage}</Error>}
    </FieldWrapper>
  );
};
export const FormCustomerMultiColumnComboBox = (fieldRenderProps) => {
  const {
    validationMessage,
    touched,
    label,
    id,
    valid,
    disabled,
    hint,
    wrapperstyle,
    ...others
  } = fieldRenderProps;
  const editorRef = React.useRef(null);
  const showValidationMessage = touched && validationMessage;
  const showHint = !showValidationMessage && hint;
  const hintId = showHint ? `${id}_hint` : "";
  const errorId = showValidationMessage ? `${id}_error` : "";
  const labelId = label ? `${id}_label` : "";
  const columns = [
    {
      field: "name",
      header: "Name",
      // width: "300px",
    },
    {
      field: "address1",
      header: "Address",
      // width: "300px",
    },
    {
      field: "city",
      header: "City",
       width: "150px",
    },
  ];
  return (
    <FieldWrapper style={wrapperstyle}>
      <Label
        id={labelId}
        editorRef={editorRef}
        editorId={id}
        editorValid={valid}
        editorDisabled={disabled}
      >
        {label}
      </Label>
      <MultiColumnComboBox
        ariaLabelledBy={labelId}
        ariaDescribedBy={`${hintId} ${errorId}`}
        ref={editorRef}
        valid={valid}
        id={id}
        disabled={disabled}
        columns={columns}
        textField={"name"}
        {...others}
        data={(others.data || []).map(item =>({
          ...item,
          name:item.name ?? '',
          address1:item.address1 ?? '',
          city:item.city ?? '',
        })).sort((a, b) => {

          const aValue = a[others.textField] ?? '';
          const bValue = b[others.textField] ?? '';
          const isANumber = /^\d/.test(aValue);
          const isBNumber = /^\d/.test(bValue);

          if (isANumber && !isBNumber) return -1;
          if (!isANumber && isBNumber) return 1;

          return aValue.localeCompare(bValue);
        })}
        
      />
      {showHint && <Hint id={hintId}>{hint}</Hint>}
      {showValidationMessage && <Error id={errorId}>{validationMessage}</Error>}
    </FieldWrapper>
  );
};
export const FormCustomerWithVendorNoMultiColumnComboBox = (fieldRenderProps) => {
  const {
    validationMessage,
    touched,
    label,
    id,
    valid,
    disabled,
    hint,
    wrapperstyle,
    ...others
  } = fieldRenderProps;
  const editorRef = React.useRef(null);
  const showValidationMessage = touched && validationMessage;
  const showHint = !showValidationMessage && hint;
  const hintId = showHint ? `${id}_hint` : "";
  const errorId = showValidationMessage ? `${id}_error` : "";
  const labelId = label ? `${id}_label` : "";
  const columns = [
    {
      field: "name",
      header: "Name",
      // width: "300px",
    },
    {
      field: "vendorNo",
      header: "Vendor No",
      // width: "300px",
    },
    {
      field: "address1",
      header: "Address",
      // width: "300px",
    },
    {
      field: "city",
      header: "City",
       width: "150px",
    },
  ];
  return (
    <FieldWrapper style={wrapperstyle}>
      <Label
        id={labelId}
        editorRef={editorRef}
        editorId={id}
        editorValid={valid}
        editorDisabled={disabled}
      >
        {label}
      </Label>
      <MultiColumnComboBox
        ariaLabelledBy={labelId}
        ariaDescribedBy={`${hintId} ${errorId}`}
        ref={editorRef}
        valid={valid}
        id={id}
        disabled={disabled}
        columns={columns}
        textField={"name"}
        {...others}
        data={(others.data || []).map(item =>({
          ...item,
          name:item.name ?? '',
          vendorNo:item.vendorNo ?? '',
          address1:item.address1 ?? '',
          city:item.city ?? '',
        })).sort((a, b) => {

          const aValue = a[others.textField] ?? '';
          const bValue = b[others.textField] ?? '';
          const isANumber = /^\d/.test(aValue);
          const isBNumber = /^\d/.test(bValue);

          if (isANumber && !isBNumber) return -1;
          if (!isANumber && isBNumber) return 1;

          return aValue.localeCompare(bValue);
        })}
        
      />
      {showHint && <Hint id={hintId}>{hint}</Hint>}
      {showValidationMessage && <Error id={errorId}>{validationMessage}</Error>}
    </FieldWrapper>
  );
};