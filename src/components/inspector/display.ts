import { Group, ItemGroup, Status, StatusKind } from "../../api/inspector/inspector";

export function groupColor(group: ItemGroup) {
    if (!group.startCoding) {
        return "info";
    }
    if (group.group === Group.Production) {
        return "primary";
    }
    return "warning";
}

export function statusColor(status: Status) {
    if (status.kind === StatusKind.Failed) {
        return "danger";
    } else if (status.kind === StatusKind.Missing) {
        return "info";
    }
    return "success";
}

export function statusContent(status: Status, displayDetail: boolean) {
    if (!displayDetail) {
        status.message = "";
    }
    if (status.kind === StatusKind.Failed && status.message.length > 0) {
        return `${status.message}`;
    }
    return status.kind;
}

export function timelineNodeColor(pass: boolean) {
    return pass ? "" : "#DF3E40";
}

export function groupTagType(group: Group) {
    if (group === Group.Production) {
        return "primary";
    }
    return "warning";
}

export function gaugeColor(value: number): string {
    let r = 28.8;
    let g = 47.6;
    let b = 67;

    const progress = value / 100;

    const rIncrease = 102.2 - r;
    const gIncrease = 177.4 - g;
    const bIncrease = 255 - b;

    if (value > 0) {
        r += rIncrease * progress;
        g += gIncrease * progress;
        b += bIncrease * progress;
    }

    return `rgb(${r}, ${g}, ${b})`;
}

export function qcStatusTagStyle(qcResult: Status[]) {
    return qcResult.length > 1 ? "qc-status-tag" : "status-tag";
}
