import React, { useEffect, useState } from 'react';

import {
  Alert,
  Button,
  Popover,
  Text,
  TextContent,
  TextList,
  TextListItem,
  TextListVariants,
  TextListItemVariants,
  TextVariants,
  Spinner,
} from '@patternfly/react-core';
import { ExclamationTriangleIcon, HelpIcon } from '@patternfly/react-icons';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';

import ReleaseLifecycle from './../ImageOutput/ReleaseLifecycle';
import ActivationKeyInformation from './../Registration/ActivationKeyInformation';
import { AwsAccountId } from './../TargetEnvironment/Aws/AwsAccountId';
import { RepositoriesTable } from './ReviewStepTables';

import { RELEASES } from '../../../../constants';
import { extractProvisioningList } from '../../../../store/helpers';
import { useAppSelector } from '../../../../store/hooks';
import { useGetOscapCustomizationsQuery } from '../../../../store/imageBuilderApi';
import { useGetSourceListQuery } from '../../../../store/provisioningApi';
import { useShowActivationKeyQuery } from '../../../../store/rhsmApi';
import {
  selectActivationKey,
  selectArchitecture,
  selectAwsAccountId,
  selectAwsShareMethod,
  selectBlueprintDescription,
  selectBlueprintName,
  selectCustomRepositories,
  selectDistribution,
  selectGcpAccountType,
  selectGcpEmail,
  selectGcpShareMethod,
  selectProfile,
  selectRegistrationType,
} from '../../../../store/wizardSlice';
import { useGetEnvironment } from '../../../../Utilities/useGetEnvironment';

const ExpirationWarning = () => {
  return (
    <div className="pf-u-mr-sm pf-u-font-size-sm pf-u-warning-color-100">
      <ExclamationTriangleIcon /> Expires 14 days after creation
    </div>
  );
};

export const ImageOutputList = () => {
  const distribution = useAppSelector((state) => selectDistribution(state));
  const arch = useAppSelector((state) => selectArchitecture(state));
  return (
    <TextContent>
      <ReleaseLifecycle />
      <TextList component={TextListVariants.dl}>
        <TextListItem
          component={TextListItemVariants.dt}
          className="pf-u-min-width"
        >
          Release
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          {RELEASES.get(distribution)}
        </TextListItem>
        <TextListItem component={TextListItemVariants.dt}>
          Architecture
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>{arch}</TextListItem>
      </TextList>
      <br />
    </TextContent>
  );
};
export const FSCList = () => {
  return (
    <TextContent>
      <br />
    </TextContent>
  );
};

export const TargetEnvAWSList = () => {
  const { data: rawAWSSources, isSuccess } = useGetSourceListQuery({
    provider: 'aws',
  });
  const awsAccountId = useAppSelector((state) => selectAwsAccountId(state));
  const awsShareMethod = useAppSelector((state) => selectAwsShareMethod(state));

  const awsSources = extractProvisioningList(rawAWSSources);
  const { isBeta } = useGetEnvironment();

  return (
    <TextContent>
      <Text component={TextVariants.h3}>AWS</Text>
      <TextList component={TextListVariants.dl}>
        <TextListItem
          component={TextListItemVariants.dt}
          className="pf-u-min-width"
        >
          Image type
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          Red Hat hosted image
          <br />
          <ExpirationWarning />
        </TextListItem>
        <TextListItem component={TextListItemVariants.dt}>
          Shared to account
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          {!isBeta() && awsAccountId}
          {isBeta() && awsShareMethod === 'sources' && isSuccess && (
            <AwsAccountId />
          )}
          {isBeta() && awsShareMethod === 'manual' && awsAccountId}
        </TextListItem>
        <TextListItem component={TextListItemVariants.dt}>
          {awsShareMethod === 'sources' ? 'Source' : null}
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          {isSuccess && awsShareMethod === 'sources'
            ? awsSources?.find((source) => source.id === source)?.name
            : null}
        </TextListItem>
        <TextListItem component={TextListItemVariants.dt}>
          Default region
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          us-east-1
        </TextListItem>
      </TextList>
      <br />
    </TextContent>
  );
};

export const TargetEnvGCPList = () => {
  const accountType = useAppSelector((state) => selectGcpAccountType(state));
  const sharedMethod = useAppSelector((state) => selectGcpShareMethod(state));
  const email = useAppSelector((state) => selectGcpEmail(state));
  return (
    <TextContent>
      <Text component={TextVariants.h3}>GCP</Text>
      <TextList component={TextListVariants.dl}>
        <TextListItem
          component={TextListItemVariants.dt}
          className="pf-u-min-width"
        >
          Image type
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          Red Hat hosted image
          <br />
          <ExpirationWarning />
        </TextListItem>
        <>
          {sharedMethod === 'withInsights' ? (
            <>
              <TextListItem component={TextListItemVariants.dt}>
                Shared with
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                Red Hat Insights only
                <br />
              </TextListItem>
            </>
          ) : (
            <>
              <TextListItem component={TextListItemVariants.dt}>
                Account type
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                {accountType === 'group'
                  ? 'Google group'
                  : accountType === 'service'
                  ? 'Service account'
                  : accountType === 'google'
                  ? 'Google account'
                  : 'Domain'}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dt}>
                {accountType === 'domain' ? 'Domain' : 'Principal'}
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                {email || accountType}
              </TextListItem>
            </>
          )}
        </>
      </TextList>
      <br />
    </TextContent>
  );
};

export const TargetEnvAzureList = () => {
  return (
    <TextContent>
      <Text component={TextVariants.h3}>Microsoft Azure</Text>
      <TextList component={TextListVariants.dl}>
        <TextListItem
          component={TextListItemVariants.dt}
          className="pf-u-min-width"
        >
          Image type
        </TextListItem>
      </TextList>
      <br />
    </TextContent>
  );
};

export const TargetEnvOciList = () => {
  return (
    <TextContent>
      <Text component={TextVariants.h3}>Oracle Cloud Infrastructure</Text>
      <TextList component={TextListVariants.dl}>
        <TextListItem
          component={TextListItemVariants.dt}
          className="pf-u-min-width"
        >
          Object Storage URL
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          The URL for the built image will be ready to copy
          <br />
        </TextListItem>
      </TextList>
      <br />
    </TextContent>
  );
};

export const TargetEnvOtherList = () => {
  return (
    <>
      <TextList component={TextListVariants.dl}>
        <TextListItem
          component={TextListItemVariants.dt}
          className="pf-u-min-width"
        >
          Image type
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          Built image will be available for download
        </TextListItem>
      </TextList>
      <br />
    </>
  );
};

export const ContentList = () => {
  const customRepositories = useAppSelector((state) =>
    selectCustomRepositories(state)
  );
  return (
    <TextContent>
      <TextList component={TextListVariants.dl}>
        <TextListItem
          component={TextListItemVariants.dt}
          className="pf-u-min-width"
        >
          Additional Red Hat
          <br />
          and 3rd party packages
        </TextListItem>
        <TextListItem
          component={TextListItemVariants.dd}
          data-testid="chosen-packages-count"
        >
          {0}
        </TextListItem>
        <TextListItem component={TextListItemVariants.dt}>
          Custom repositories
        </TextListItem>
        <TextListItem
          component={TextListItemVariants.dd}
          data-testid="custom-repositories-count"
        >
          {customRepositories?.length > 0 ? (
            <Popover
              position="bottom"
              headerContent="Custom repositories"
              hasAutoWidth
              minWidth="30rem"
              bodyContent={<RepositoriesTable />}
            >
              <Button
                variant="link"
                aria-label="About custom repositories"
                className="pf-u-p-0"
              >
                {customRepositories?.length || 0}
              </Button>
            </Popover>
          ) : (
            0
          )}
        </TextListItem>
      </TextList>
      <br />
    </TextContent>
  );
};

export const RegisterLaterList = () => {
  return (
    <TextContent>
      <TextList component={TextListVariants.dl}>
        <TextListItem
          component={TextListItemVariants.dt}
          className="pf-u-min-width"
        >
          Registration type
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          Register the system later
        </TextListItem>
      </TextList>
      <br />
    </TextContent>
  );
};

export const RegisterNowList = () => {
  const activationKey = useAppSelector((state) => selectActivationKey(state));
  const registrationType = useAppSelector((state) =>
    selectRegistrationType(state)
  );
  const [orgId, setOrgId] = useState<string | undefined>(undefined);
  const { auth } = useChrome();

  useEffect(() => {
    (async () => {
      const userData = await auth?.getUser();
      const id = userData?.identity?.internal?.org_id;
      setOrgId(id);
    })();
  });
  const { isError } = useShowActivationKeyQuery(
    // @ts-ignore - type of 'activationKey' might not be strictly compatible with the expected type for 'name'.
    { name: activationKey },
    {
      skip: !activationKey,
    }
  );
  return (
    <>
      <TextContent>
        <TextList component={TextListVariants.dl}>
          <TextListItem
            component={TextListItemVariants.dt}
            className="pf-u-min-width"
          >
            Registration type
          </TextListItem>
          <TextListItem
            component={TextListItemVariants.dd}
            data-testid="review-registration"
          >
            <TextList isPlain>
              {registrationType?.startsWith('register-now') && (
                <TextListItem>
                  Register with Red Hat Subscription Manager (RHSM)
                  <br />
                </TextListItem>
              )}
              {registrationType === 'register-now-insights' ||
                (registrationType === 'register-now-rhc' && (
                  <TextListItem>
                    Connect to Red Hat Insights
                    <br />
                  </TextListItem>
                ))}
              {registrationType === 'register-now-rhc' && (
                <TextListItem>
                  Use remote host configuration (rhc) utility
                  <br />
                </TextListItem>
              )}
            </TextList>
          </TextListItem>
          <TextListItem component={TextListItemVariants.dt}>
            Activation key
            <Popover
              bodyContent={
                <TextContent>
                  <Text>
                    Activation keys enable you to register a system with
                    appropriate subscriptions, system purpose, and repositories
                    attached.
                    <br />
                    <br />
                    If using an activation key with command line registration,
                    you must provide your organization&apos;s ID. Your
                    organization&apos;s ID is{' '}
                    {orgId !== undefined ? orgId : <Spinner size="md" />}
                  </Text>
                </TextContent>
              }
            >
              <Button
                variant="plain"
                aria-label="About activation key"
                className="pf-u-pl-sm pf-u-pt-0 pf-u-pb-0"
                size="sm"
              >
                <HelpIcon />
              </Button>
            </Popover>
          </TextListItem>
          <TextListItem component={TextListItemVariants.dd}>
            <ActivationKeyInformation />
          </TextListItem>
        </TextList>
        <br />
      </TextContent>
      {isError && (
        <Alert
          title="Information about the activation key unavailable"
          variant="danger"
          isPlain
          isInline
        >
          Information about the activation key cannot be loaded. Please check
          the key was not removed and try again later.
        </Alert>
      )}
    </>
  );
};

export const ImageDetailsList = () => {
  const blueprintName = useAppSelector((state) => selectBlueprintName(state));
  const blueprintDescription = useAppSelector((state) =>
    selectBlueprintDescription(state)
  );

  return (
    <TextContent>
      <TextList component={TextListVariants.dl}>
        {blueprintName && (
          <>
            <TextListItem
              component={TextListItemVariants.dt}
              className="pf-u-min-width"
            >
              Image name
            </TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              {blueprintName}
            </TextListItem>
          </>
        )}
        {blueprintDescription && (
          <>
            <TextListItem
              component={TextListItemVariants.dt}
              className="pf-u-min-width"
            >
              Description
            </TextListItem>
            <TextListItem component={TextListItemVariants.dd}>
              {blueprintDescription}
            </TextListItem>
          </>
        )}
      </TextList>
      <br />
    </TextContent>
  );
};

export const OscapList = () => {
  const oscapProfile = useAppSelector((state) => selectProfile(state));
  const release = useAppSelector((state) => selectDistribution(state));
  const { data } = useGetOscapCustomizationsQuery(
    {
      distribution: release,
      // @ts-ignore if oscapProfile is undefined the query is going to get skipped, so it's safe here to ignore the linter here
      profile: oscapProfile,
    },
    {
      skip: !oscapProfile,
    }
  );
  return (
    <TextContent>
      <TextList component={TextListVariants.dl}>
        <TextListItem
          component={TextListItemVariants.dt}
          className="pf-u-min-width"
        >
          Profile name:
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          {data?.openscap?.profile_name}
        </TextListItem>
      </TextList>
      <TextList component={TextListVariants.dl}>
        <TextListItem
          component={TextListItemVariants.dt}
          className="pf-u-min-width"
        >
          Profile description:
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          {data?.openscap?.profile_description}
        </TextListItem>
      </TextList>
      <TextList component={TextListVariants.dl}>
        <TextListItem
          component={TextListItemVariants.dt}
          className="pf-u-min-width"
        >
          Reference ID:
        </TextListItem>
        <TextListItem component={TextListItemVariants.dd}>
          {oscapProfile}
        </TextListItem>
      </TextList>
      <br />
    </TextContent>
  );
};