import React from 'react';

import {
  ActionGroup,
  Button,
  FileUpload,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Modal,
  ModalVariant,
} from '@patternfly/react-core';
import { DropEvent } from '@patternfly/react-core/dist/esm/helpers';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux';
import { useNavigate } from 'react-router-dom';
import { parse } from 'toml';

import { mapOnPremToHosted } from './helpers/onPremToHostedBlueprintMapper';

import { useAppDispatch } from '../../store/hooks';
import { BlueprintExportResponse } from '../../store/imageBuilderApi';
import { wizardState } from '../../store/wizardSlice';
import { resolveRelPath } from '../../Utilities/path';
import { mapExportRequestToState } from '../CreateImageWizard/utilities/requestMapper';

interface ImportBlueprintModalProps {
  setShowImportModal: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
}

export const ImportBlueprintModal: React.FunctionComponent<
  ImportBlueprintModalProps
> = ({ setShowImportModal, isOpen }: ImportBlueprintModalProps) => {
  const onImportClose = () => {
    setShowImportModal(false);
    setFilename('');
    setFileContent('');
    setIsOnPrem(false);
    setIsRejected(false);
    setIsInvalidFormat(false);
  };
  const [fileContent, setFileContent] = React.useState('');
  const [importedBlueprint, setImportedBlueprint] =
    React.useState<wizardState>();
  const [isInvalidFormat, setIsInvalidFormat] = React.useState(false);
  const [filename, setFilename] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isRejected, setIsRejected] = React.useState(false);
  const [isOnPrem, setIsOnPrem] = React.useState(false);
  const dispatch = useAppDispatch();
  const handleFileInputChange = (
    _event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLElement>,
    file: File
  ) => {
    setFileContent('');
    setFilename(file.name);
    setIsRejected(false);
    setIsInvalidFormat(false);
  };
  React.useEffect(() => {
    if (filename && fileContent) {
      try {
        const isToml = filename.endsWith('.toml');
        const isJson = filename.endsWith('.json');
        if (isToml) {
          const tomlBlueprint = parse(fileContent);
          const blueprintFromFile = mapOnPremToHosted(tomlBlueprint);
          const importBlueprintState = mapExportRequestToState(
            blueprintFromFile,
            []
          );
          setIsOnPrem(true);
          setImportedBlueprint(importBlueprintState);
        } else if (isJson) {
          const blueprintFromFile = JSON.parse(fileContent);
          try {
            const blueprintExportedResponse: BlueprintExportResponse = {
              name: blueprintFromFile.name,
              description: blueprintFromFile.description,
              distribution: blueprintFromFile.distribution,
              customizations: blueprintFromFile.customizations,
              metadata: blueprintFromFile.metadata,
            };
            const importBlueprintState = mapExportRequestToState(
              blueprintExportedResponse,
              blueprintFromFile.image_requests || []
            );
            setIsOnPrem(false);
            setImportedBlueprint(importBlueprintState);
          } catch {
            const blueprintFromFileMapped =
              mapOnPremToHosted(blueprintFromFile);
            const importBlueprintState = mapExportRequestToState(
              blueprintFromFileMapped,
              []
            );
            setIsOnPrem(true);
            setImportedBlueprint(importBlueprintState);
          }
        }
      } catch (error) {
        setIsInvalidFormat(true);
        dispatch(
          addNotification({
            variant: 'warning',
            title: 'File is not a valid blueprint',
            description: error?.data?.error?.message,
          })
        );
      }
    }
  }, [filename, fileContent]);
  const handleClear = () => {
    setFilename('');
    setFileContent('');
    setIsOnPrem(false);
    setIsRejected(false);
    setIsInvalidFormat(false);
  };
  const handleDataChange = (_: DropEvent, value: string) => {
    setFileContent(value);
  };
  const handleFileRejected = () => {
    setIsRejected(true);
    setIsOnPrem(false);
    setFileContent('');
    setFilename('');
  };
  const handleFileReadStarted = () => {
    setIsLoading(true);
  };
  const handleFileReadFinished = () => {
    setIsLoading(false);
  };
  const navigate = useNavigate();

  return (
    <Modal
      variant={ModalVariant.medium}
      isOpen={isOpen}
      title={'Import pipeline'}
      onClose={onImportClose}
      ouiaId="import-blueprint-modal"
    >
      <Form>
        <FormGroup fieldId="import-blueprint-file-upload">
          <FileUpload
            id="import-blueprint-file-upload"
            type="text"
            value={fileContent}
            filename={filename}
            filenamePlaceholder="Drag and drop a file or upload one"
            onFileInputChange={handleFileInputChange}
            onDataChange={handleDataChange}
            onReadStarted={handleFileReadStarted}
            onReadFinished={handleFileReadFinished}
            onClearClick={handleClear}
            isLoading={isLoading}
            isReadOnly={true}
            browseButtonText="Upload"
            dropzoneProps={{
              accept: { 'text/json': ['.json'], 'text/plain': ['.toml'] },
              maxSize: 25000,
              onDropRejected: handleFileRejected,
            }}
            validated={isRejected || isInvalidFormat ? 'error' : 'default'}
          />
          <FormHelperText>
            <HelperText>
              <HelperTextItem
                variant={
                  isRejected ? 'error' : isOnPrem ? 'warning' : 'default'
                }
              >
                {isRejected
                  ? 'Must be a valid Blueprint JSON file no larger than 25 KB'
                  : isInvalidFormat
                  ? 'Not compatible with the blueprints format.'
                  : isOnPrem
                  ? 'Importing on-premises blueprints is currently in beta. Results may vary.'
                  : 'Upload a JSON file'}
              </HelperTextItem>
            </HelperText>
          </FormHelperText>
        </FormGroup>
        <ActionGroup>
          <Button
            type="button"
            isDisabled={isRejected || isInvalidFormat || !fileContent}
            onClick={() =>
              navigate(resolveRelPath(`imagewizard/import`), {
                state: { blueprint: importedBlueprint },
              })
            }
            ouiaId="import-blueprint-finish"
            data-testid="import-blueprint-finish"
          >
            Review and finish
          </Button>
          <Button variant="link" type="button" onClick={onImportClose}>
            Cancel
          </Button>
        </ActionGroup>
      </Form>
    </Modal>
  );
};
