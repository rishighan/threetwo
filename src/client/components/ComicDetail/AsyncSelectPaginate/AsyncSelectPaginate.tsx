import React, { ReactElement, useCallback, useState } from "react";
import axios from "axios";
import { isNil } from "lodash";
import Creatable from "react-select/creatable";
import { withAsyncPaginate } from "react-select-async-paginate";
import { METRON_SERVICE_URI } from "../../../constants/endpoints";

const CreatableAsyncPaginate = withAsyncPaginate(Creatable);

export interface AsyncSelectPaginateProps {
  metronResource?: string;
  placeholder?: string | React.ReactNode;
  value?: object;
  onChange?(...args: unknown[]): unknown;
  meta?: Record<string, unknown>;
  input?: Record<string, unknown>;
  name?: string;
  type?: string;
}

interface AdditionalType {
  page: number | null;
}

interface MetronResultItem {
  name?: string;
  __str__?: string;
  id: number;
}

export const AsyncSelectPaginate = (props: AsyncSelectPaginateProps): ReactElement => {
  const [isAddingInProgress, setIsAddingInProgress] = useState(false);

  const loadData = useCallback(async (
    query: string,
    _loadedOptions: unknown,
    additional?: AdditionalType
  ) => {
    const page = additional?.page ?? 1;
    const options = {
      method: "GET",
      resource: props.metronResource || "",
      query: { name: query, page },
    };
    const response = await axios.post(`${METRON_SERVICE_URI}/fetchResource`, options);
    const results = response.data.results.map((result: MetronResultItem) => ({
      label: result.name || result.__str__,
      value: result.id,
    }));
    return {
      options: results,
      hasMore: !isNil(response.data.next),
      additional: {
        page: !isNil(response.data.next) ? page + 1 : null,
      },
    };
  }, [props.metronResource]);

  return (
    <CreatableAsyncPaginate
      debounceTimeout={200}
      isDisabled={isAddingInProgress}
      value={props.value}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      loadOptions={loadData as any}
      placeholder={props.placeholder}
      onChange={props.onChange}
      additional={{
        page: 1,
      }}
    />
  );
};

export default AsyncSelectPaginate;
