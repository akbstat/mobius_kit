export async function listEvents(): Promise<{ form: Form[], visit: Visit[], binding: Binding[] }> {
    const form = [
        { id: 0, name: "访视日期", page: 1 },
        { id: 1, name: "知情同意书", page: 2 },
        { id: 2, name: "人口统计学资料", page: 3 },
        { id: 3, name: "既往病史/现病史", page: 4 },
        { id: 4, name: "生命体征", page: 5 },
        { id: 5, name: "血常规", page: 6 },
        { id: 6, name: "病毒学检查", page: 7 },
    ];
    const visit = [
        { id: 0, name: "V1筛选期（D-35 ~D-1）" },
        { id: 1, name: "V2第0周（D1）" },
        { id: 2, name: "V3第2周（D15）" },
        { id: 3, name: "V4第4周（D29）" },
        { id: 4, name: "V4第6周（D43）" },
        { id: 5, name: "V5第8周（D57）" },
        { id: 6, name: "Running Record" },
    ];
    const binding = [
        { parent: 0, children: [0, 1, 2, 3, 4, 5] },
        { parent: 1, children: [0] },
        { parent: 2, children: [0] },
        { parent: 3, children: [6] },
        { parent: 4, children: [0, 1, 2, 4, 5] },
        { parent: 5, children: [0, 1, 2, 4] },
        { parent: 6, children: [0, 1, 5] },
    ]
    return {
        form,
        visit,
        binding,
    }
}

export interface Form {
    id: number,
    name: string,
    page: number,
}

export interface Visit {
    id: number,
    name: string,
}

export interface Binding {
    parent: number,
    children: number[],
}

