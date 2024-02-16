import React from 'react';
import { useQuery } from 'react-query';
import classNames from 'classnames';
import { fetchConnectionStatus } from '~/api/ping';

export default function ConnectionStatus() {
  const { data: status, isFetching } = useQuery('connectionStatus', fetchConnectionStatus, {
    refetchInterval: 60000,
    retry: false,
  });

  const getStatus = () => {
    if (isFetching) return 'connecting';
    return status || 'disconnected';
  };

  const colorStatus = {
    connected: 'bg-info',
    disconnected: 'bg-error',
    connecting: 'bg-warning',
  };

  const statusMessage = getStatus();
  const divClassNames = classNames(
    colorStatus[statusMessage],
    'mx-5 h-5 w-5 rounded-full border-2'
  );

  return (
    <div className="tooltip" data-tip={statusMessage}>
      <div className={divClassNames} />
    </div>
  );
}
