import React, { ReactElement, useCallback, useState } from "react";
import PropTypes from "prop-types";
import { fetchMetronResource } from "../../../actions/metron.actions";
import Creatable from "react-select/creatable";
import { withAsyncPaginate } from "react-select-async-paginate";
const CreatableAsyncPaginate = withAsyncPaginate(Creatable);

export const AsyncSelectPaginate = (props): ReactElement => {
  const [value, setValue] = useState(null);
  const [isAddingInProgress, setIsAddingInProgress] = useState(false);

  const loadData = useCallback((query, loadedOptions, { page }) => {
    return fetchMetronResource({
      method: "GET",
      resource: props.metronResource,
      query: {
        name: query,
        page,
      },
    });
  }, []);

  return (
    <CreatableAsyncPaginate
      SelectComponent={Creatable}
      debounceTimeout={200}
      isDisabled={isAddingInProgress}
      value={props.value}
      loadOptions={loadData}
      placeholder={props.placeholder}
      // onCreateOption={onCreateOption}
      onChange={props.onChange}
      // cacheUniqs={[cacheUniq]}
      additional={{
        page: 1,
      }}
    />
  );
};

AsyncSelectPaginate.propTypes = {
  metronResource: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.object,
  onChange: PropTypes.func,
};

export default AsyncSelectPaginate;
