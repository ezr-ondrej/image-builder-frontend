import { useMemo } from 'react';

import { useAppSelector } from '../../store/hooks';
import { selectStepValidation } from '../../store/wizardSlice';

type ValidationType =
  | 'fileSystem'
  | 'customRepositories'
  | 'additionalPackages'
  | 'details'
  | 'review';

export default function useStepValidation() {
  const fileSystemValidation = useAppSelector(
    selectStepValidation('file-system')
  );

  const steps = useMemo(() => {
    const validationList: {
      id: ValidationType;
      invalid?: boolean;
    }[] = [
      {
        id: 'fileSystem',
        invalid: fileSystemValidation === 'error',
      },
      {
        id: 'customRepositories',
      },
      {
        id: 'additionalPackages',
      },
      {
        id: 'details',
      },
      {
        id: 'review',
      },
    ];

    const result: Partial<
      Record<ValidationType, { disableNext: boolean; disableStep: boolean }>
    > = {};

    const failedIndex = validationList.findIndex(({ id, invalid = false }) => {
      result[id] = {
        disableNext: invalid, // The next option is disabled if true
        disableStep: false, // The current step is not disabled
      };
      // If invalid skip out of the of loop
      return invalid;
    });

    // If we have a failing validation above, propogate that failure to all follow up steps
    if (failedIndex !== -1) {
      validationList.slice(failedIndex + 1).forEach(({ id }) => {
        result[id] = {
          disableNext: true,
          disableStep: true,
        };
      });
    }

    return result;
  }, [fileSystemValidation]);

  return steps as Record<
    ValidationType,
    { disableNext: boolean; disableStep: boolean }
  >;
}
