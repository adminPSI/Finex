import { useEffect, useState } from "react";

import {
    TimeCardProvider,
    useTimecardContext,
} from "../../contexts/timecardContext";
import usePrivilege from "../../helper/usePrivilege";
import CustomBreadScrum from "../Shared/CustomBreadScrum";
import CustomButton from "../Shared/CustomButton";
import AddBackupSupervisor from "../TimecardSetup/AddBackupSupervisor";
import SupervisorSetup from "../TimecardSetup/SupervisorSetup";

export default function SupervisorSetupPage() {
    const [visible, setVisible] = useState(false);
    const toggleDialog = () => {
        setVisible(!visible);
    };

    const isFormOpen = useTimecardContext();

    useEffect(() => {
        if (isFormOpen) {
            toggleDialog();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFormOpen]);
    const breadScrumData = [
        {
            title: "Supervisor Setup",
            link: "",
        },
    ];
    const { checkPrivialgeGroup, loading, error } = usePrivilege('HRSetup')
    if (loading) return <div>Loading privileges...</div>
    if (error) return <div>Error: {error}</div>
    return (
        <TimeCardProvider>
            <>
                {checkPrivialgeGroup("HRSetup", 1) && (
                    <div>
                        <CustomBreadScrum data={breadScrumData} />
                        <div className="d-flex  k-flex-row k-w-full k-justify-content-between mb-3">
                            <div className="d-flex k-flex-column">
                                <h1>Supervisor Setup</h1>
                            </div>
                            <div className="d-flex k-flex-row gap-2">

                                <div>
                                    <CustomButton
                                        className="k-button k-button-lg k-rounded-lg"
                                        onClick={toggleDialog}
                                        text="Create New Supervisor Backup"
                                        themeColor="primary"
                                        fillMode={"solid"}
                                    />
                                </div>
                            </div>
                        </div>

                        <SupervisorSetup toggleDialog={toggleDialog} />



                        {visible && (
                            <AddBackupSupervisor toggleDialog={toggleDialog} />
                        )}
                    </div>
                )}
            </>
        </TimeCardProvider>
    );
}
