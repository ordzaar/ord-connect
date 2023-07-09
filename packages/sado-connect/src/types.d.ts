declare interface Window {
    chrome: {
        app: {
            isInstalled: boolean;
            InstallState: {
                DISABLED: 'disabled';
                INSTALLED: 'installed';
                NOT_INSTALLED: 'not_installed';
            };
            RunningState: {
                CANNOT_RUN: 'cannot_run';
                READY_TO_RUN: 'ready_to_run';
                RUNNING: 'running';
            };
        };
    };
}
