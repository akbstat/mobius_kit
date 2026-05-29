<script lang="ts" setup>
import { computed, onMounted, ref, Ref } from 'vue';
import { qcDetailMain, qcDetailSupp, QcDetail, QcDetailRequest, openQcFile, StatusKind, htmlQcResult, QcResultHtml, DatasetSummary, Dataset, VariableDifferAttributesList } from '../../api/inspector/inspector';
import { statusColor, statusContent } from './display';
import { ElMessage } from 'element-plus';


const activeVariable = ref("0");
const qcResultHtml: Ref<QcResultHtml | null> = ref(null);
const valueComparsionResultForVariables = computed(() => {
    const variables = qcResultHtml.value?.valuesComparsionResultsForVariables;
    if (variables) {
        return variables[parseInt(activeVariable.value)].records;
    }
    return [];
});
const props = defineProps<{ param: QcDetailRequest, supp: boolean }>();
const { product, trial, purpose, kind, item, ignore } = props.param;
const { supp } = props;
const qcDetails: Ref<QcDetail[]> = ref([]);
const menu: Ref<{ title: string, alert: boolean, route: () => void }[] | null> = ref(null);
const disabled = computed(() => {
    if (qcDetails.value.length > 0) {
        const qc = qcDetails.value[0];
        return qc.status.kind === StatusKind.Missing ? true : false;
    }
    return true;
});

async function openQcDetail() {
    try {
        await openQcFile({ product, trial, purpose, kind, item, supp })
    } catch (error) {
        ElMessage.error(`Failed to open file, because: ${error}`);
    }
}

function buildDatasetSummary(source: DatasetSummary | undefined): Dataset[] {
    if (source) {
        return [source.base as Dataset, source.compare as Dataset]
    }
    return [];
}

function buildListingOfCommonVariablesWithDifferingAttributes(source: VariableDifferAttributesList | undefined): { variable: string, dataset: string, variableType: { value: string, highlight: boolean }, variableLength: { value: string, highlight: boolean }, label: { value: string, highlight: boolean } }[] {
    const result: { variable: string, dataset: string, variableType: { value: string, highlight: boolean }, variableLength: { value: string, highlight: boolean }, label: { value: string, highlight: boolean } }[] = [];
    if (!source) {
        return result;
    }
    source.variables.forEach(v => {
        const { base, compare } = v.attribute;
        result.push({
            variable: v.variable,
            dataset: base?.dataset as string,
            variableType: { value: base?.variableType as string, highlight: base?.variableType !== compare?.variableType },
            variableLength: { value: base?.variableLength as string, highlight: base?.variableLength !== compare?.variableLength },
            label: { value: base?.label as string, highlight: base?.label !== compare?.label },
        });
        result.push({
            variable: v.variable,
            dataset: compare?.dataset as string,
            variableType: { value: compare?.variableType as string, highlight: base?.variableType !== compare?.variableType },
            variableLength: { value: compare?.variableLength as string, highlight: base?.variableLength !== compare?.variableLength },
            label: { value: compare?.label as string, highlight: base?.label !== compare?.label },
        });
    });
    return result;
}


function menuList() {
    const list = [];
    if (!qcResultHtml.value) return;
    const { datasetSummary,
        variablesSummary,
        listOfCommonVariablesWithDifferingAttributes,
        comparsionResultsForObservations,
        observationSummary,
        valuesComparsionSummary,
        variableWithUnequalValues,
        valuesComparsionResultsForVariables } = qcResultHtml.value;
    if (datasetSummary) {
        list.push({
            title: "Data Set Summary", alert: (datasetSummary.base?.nobs !== datasetSummary.compare?.nobs) || (datasetSummary.base?.nvar !== datasetSummary.compare?.nvar), route: () => {
                document.getElementById("dataset-summary")?.scrollIntoView({ behavior: "smooth" });
            }
        });
    }
    if (variablesSummary) {
        list.push({
            title: "Variables Summary", alert: variablesSummary.numberOfVariablesWithDifferingAttributes ? true : false, route: () => {
                document.getElementById('variables-summary')?.scrollIntoView({ behavior: "smooth" });
            }
        });
    }
    if (listOfCommonVariablesWithDifferingAttributes) {
        list.push({
            title: "Listing of Common Variables with Differing Attributes", alert: true, route: () => {
                document.getElementById('list-of-common-variables-with-differing-attributes')?.scrollIntoView({ behavior: "smooth" });
            }
        });
    }
    if (comparsionResultsForObservations) {
        list.push({
            title: "Comparison Results for Observations", alert: true, route: () => {
                document.getElementById('comparsion-results-for-observations')?.scrollIntoView({ behavior: "smooth" });
            }
        });
    }
    if (observationSummary) {
        list.push({
            title: "Observation Summary", alert: observationSummary.summaryList.find(l => l.observation.includes('Unequal')) ? true : false, route: () => {
                document.getElementById('observation-summary')?.scrollIntoView({ behavior: "smooth" });
            }
        });
    }
    if (valuesComparsionSummary) {
        list.push({
            title: "Values Comparison Summary", alert: true, route: () => {
                document.getElementById('values-comparsion-summary')?.scrollIntoView({ behavior: "smooth" });
            }
        });
    }
    if (variableWithUnequalValues) {
        list.push({
            title: "Variables with Unequal Values", alert: true, route: () => {
                document.getElementById('variable-with-unequal-values')?.scrollIntoView({ behavior: "smooth" });
            }
        });
    }
    if (valuesComparsionResultsForVariables) {
        list.push({
            title: "Value Comparison Results for Variables", alert: true, route: () => {
                document.getElementById('value-comparsion-results-for-variables')?.scrollIntoView({ behavior: "smooth" });
            }
        });
    }
    menu.value = list;
}

onMounted(async () => {
    qcResultHtml.value = await htmlQcResult({ product, trial, purpose, kind, item, supp });
    menuList();
    qcDetails.value = [supp ? await qcDetailSupp({ product, trial, purpose, kind, item, ignore }) : await qcDetailMain({ product, trial, purpose, kind, item, ignore })];
});
</script>

<template>
    <el-table style="margin-bottom: 3px;" :data="qcDetails">
        <el-table-column>
            <template #default="scope">
                <el-tag class="status-tag" :type="statusColor(scope.row.status)">
                    {{ statusContent(scope.row.status, true) }}
                </el-tag>
            </template>
        </el-table-column>
        <el-table-column width="50">
            <template #default>
                <el-button :disabled="disabled" @click="openQcDetail" type="primary" link>
                    <el-icon>
                        <Reading />
                    </el-icon>
                </el-button>
            </template>
        </el-table-column>
    </el-table>
    <el-scrollbar height="555px">
        <el-container>
            <el-aside>
                <el-menu style="height: 70vh;">
                    <el-menu-item :index="key.toString()" :key="key" v-for="(item, key) in menu" @click="item.route">
                        <el-tooltip class="box-item" effect="dark" :content="item.title" placement="right">
                            <el-text truncated :type="item.alert ? 'danger' : ''">
                                {{ item.title }}
                            </el-text>
                        </el-tooltip>
                    </el-menu-item>
                </el-menu>
            </el-aside>
            <el-main>
                <el-scrollbar height="480px">
                    <el-space direction="vertical" :size="40">
                        <el-card id="dataset-summary" v-if="qcResultHtml?.datasetSummary">
                            <template #header>
                                <div style="text-align: center;">
                                    <el-text size="large">Data Set Summary</el-text>
                                </div>
                            </template>
                            <el-table :data="buildDatasetSummary(qcResultHtml?.datasetSummary)">
                                <el-table-column label="Dataset" prop="dataset" />
                                <el-table-column label="Created" prop="created" width="170" />
                                <el-table-column label="Modified" prop="modified" width="170" />
                                <el-table-column label="NVar" width="80">
                                    <template #default="scope">
                                        <el-text
                                            :type="qcResultHtml?.datasetSummary?.base?.nvar !== qcResultHtml?.datasetSummary?.compare?.nvar ? 'danger' : ''">
                                            {{ scope.row.nvar }}
                                        </el-text>
                                    </template>
                                </el-table-column>
                                <el-table-column label="NObs" width="80">
                                    <template #default="scope">
                                        <el-text
                                            :type="qcResultHtml?.datasetSummary?.base?.nobs !== qcResultHtml?.datasetSummary?.compare?.nobs ? 'danger' : ''">
                                            {{ scope.row.nobs }}
                                        </el-text>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-card>

                        <el-card id="variables-summary" v-if="qcResultHtml?.variablesSummary">
                            <template #header>
                                <div style="text-align: center;">
                                    <el-text size="large" style="margin-bottom: 100;">Variables Summary</el-text>
                                </div>
                            </template>
                            <div>
                                <el-text size="large">
                                    Number of Variables in Common: {{
                                        qcResultHtml?.variablesSummary?.numberOfVariablesInCommon
                                    }}
                                </el-text>
                            </div>
                            <div>
                                <el-text size="large" type="danger"
                                    v-if="qcResultHtml?.variablesSummary?.numberOfVariablesWithDifferingAttributes">
                                    Number of Variables with Differing Attributes: {{
                                        qcResultHtml?.variablesSummary?.numberOfVariablesWithDifferingAttributes
                                    }}
                                </el-text>
                            </div>
                        </el-card>

                        <el-card id="list-of-common-variables-with-differing-attributes"
                            v-if="qcResultHtml?.listOfCommonVariablesWithDifferingAttributes">
                            <template #header>
                                <div style="text-align: center;">
                                    <el-text size="large" style="margin-bottom: 100;">Listing of Common Variables with
                                        Differing
                                        Attributes</el-text>
                                </div>
                            </template>
                            <el-table
                                :data="buildListingOfCommonVariablesWithDifferingAttributes(qcResultHtml?.listOfCommonVariablesWithDifferingAttributes)"
                                :span-method="({
                                    rowIndex,
                                    columnIndex,
                                }) => {
                                    if (columnIndex === 0) {
                                        if (rowIndex % 2 === 0) {
                                            return {
                                                rowspan: 2,
                                                colspan: 1,
                                            }
                                        } else {
                                            return {
                                                rowspan: 0,
                                                colspan: 0,
                                            }
                                        }
                                    }
                                }">
                                <el-table-column label="Variable" prop="variable" />
                                <el-table-column width="300" label="Dataset" prop="dataset" />
                                <el-table-column label="Type">
                                    <template #default="scope">
                                        <el-text :type="scope.row.variableType.highlight ? 'danger' : ''">
                                            {{ scope.row.variableType.value }}
                                        </el-text>
                                    </template>
                                </el-table-column>
                                <el-table-column label="Length">
                                    <template #default="scope">
                                        <el-text :type="scope.row.variableLength.highlight ? 'danger' : ''">
                                            {{ scope.row.variableLength.value }}
                                        </el-text>
                                    </template>
                                </el-table-column>
                                <el-table-column label="Label">
                                    <template #default="scope">
                                        <el-text :type="scope.row.label.highlight ? 'danger' : ''">
                                            {{ scope.row.label.value }}
                                        </el-text>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-card>

                        <el-card id="comparsion-results-for-observations"
                            v-if="qcResultHtml?.comparsionResultsForObservations">
                            <template #header>
                                <div style="text-align: center;">
                                    <el-text size="large">Comparison Results for Observations</el-text>
                                </div>
                            </template>
                            <div v-for="log in qcResultHtml?.comparsionResultsForObservations">
                                <el-text>
                                    {{ log }}
                                </el-text>
                            </div>
                        </el-card>

                        <el-card id="observation-summary" v-if="qcResultHtml?.observationSummary">
                            <template #header>
                                <div style="text-align: center;">
                                    <el-text size="large" style="margin-bottom: 100;">Observation Summary</el-text>
                                </div>
                            </template>
                            <el-table :data="qcResultHtml?.observationSummary?.summaryList">
                                <el-table-column label="Observation">
                                    <template #default="scope">
                                        <el-text
                                            :type="scope.row.observation.includes('Unequal') || scope.row.base !== scope.row.compare ? 'danger' : ''">
                                            {{ scope.row.observation }}
                                        </el-text>
                                    </template>
                                </el-table-column>
                                <el-table-column label="Base">
                                    <template #default="scope">
                                        <el-text
                                            :type="scope.row.observation.includes('Unequal') || scope.row.base !== scope.row.compare ? 'danger' : ''">
                                            {{ scope.row.base }}
                                        </el-text>
                                    </template>
                                </el-table-column>
                                <el-table-column label="Compare">
                                    <template #default="scope">
                                        <el-text
                                            :type="scope.row.observation.includes('Unequal') || scope.row.base !== scope.row.compare ? 'danger' : ''">
                                            {{ scope.row.compare }}
                                        </el-text>
                                    </template>
                                </el-table-column>
                            </el-table>
                            <div>
                                <div v-for="log in qcResultHtml?.observationSummary?.summaryLogs">
                                    <el-text
                                        :type="(log.includes('Variables Unequal') || log.includes('but not in')) && !log.includes('Variables Unequal: 0') ? 'danger' : ''">
                                        {{ log }}
                                    </el-text>
                                </div>
                            </div>
                        </el-card>

                        <el-card id="values-comparsion-summary" v-if="qcResultHtml?.valuesComparsionSummary">
                            <template #header>
                                <div style="text-align: center;">
                                    <el-text size="large" style="margin-bottom: 100;">Values Comparison
                                        Summary</el-text>
                                </div>
                            </template><el-text
                                v-if="qcResultHtml?.valuesComparsionSummary?.numberOfVariablesComparedWithAllObservationsEqual"
                                size="large">
                                Number of Variables Compared with All Observations Equal: {{
                                    qcResultHtml?.valuesComparsionSummary?.numberOfVariablesComparedWithAllObservationsEqual
                                }}
                            </el-text>
                            <div
                                v-if="qcResultHtml?.valuesComparsionSummary?.numberOfVariablesComparedWithSomeObservationsUnequal">
                                <el-text size="large" type="danger">
                                    Number of Variables Compared with Some Observations Unequal: {{
                                        qcResultHtml?.valuesComparsionSummary?.numberOfVariablesComparedWithSomeObservationsUnequal
                                    }}
                                </el-text>
                            </div>
                            <div v-if="qcResultHtml?.valuesComparsionSummary?.totalNumberOfValuesWithCompareUnequal">
                                <el-text size="large" type="danger">
                                    Total Number of Values which Compare Unequal: {{
                                        qcResultHtml?.valuesComparsionSummary?.totalNumberOfValuesWithCompareUnequal
                                    }}
                                </el-text>
                            </div>
                            <div v-if="qcResultHtml?.valuesComparsionSummary?.totalNumberOfValuesNotExactlyEqual">
                                <el-text size="large" type="danger">
                                    Total Number of Values not EXACTLY Equal: {{
                                        qcResultHtml?.valuesComparsionSummary?.totalNumberOfValuesNotExactlyEqual
                                    }}
                                </el-text>
                            </div>
                            <div v-if="qcResultHtml?.valuesComparsionSummary?.maximumDifferenceCriterionValue">
                                <el-text size="large" type="danger">
                                    Maximum Difference Criterion Value: {{
                                        qcResultHtml?.valuesComparsionSummary?.maximumDifferenceCriterionValue
                                    }}
                                </el-text>
                            </div>
                        </el-card>

                        <el-card id="variable-with-unequal-values" v-if="qcResultHtml?.variableWithUnequalValues">
                            <template #header>
                                <div style="text-align: center;">
                                    <el-text size="large" style="margin-bottom: 100;">Variables with Unequal
                                        Values</el-text>
                                </div>
                            </template>
                            <el-table :data="qcResultHtml?.variableWithUnequalValues">
                                <el-table-column label="Variable" prop="variable" />
                                <el-table-column label="Type" prop="variableType" />
                                <el-table-column label="Len1" prop="len1" />
                                <el-table-column label="Len2" prop="len2" />
                                <el-table-column label="Label" width="200" prop="label" />
                                <el-table-column label="Ndif" prop="ndif" />
                                <el-table-column label="MaxDif" prop="maxdif" />
                            </el-table>
                        </el-card>

                        <el-card id="value-comparsion-results-for-variables"
                            v-if="qcResultHtml?.valuesComparsionResultsForVariables">
                            <template #header>
                                <div style="text-align: center;">
                                    <el-text size="large" style="margin-bottom: 100;">Value Comparison Results for
                                        Variables</el-text>
                                </div>
                            </template>
                            <el-tabs type="card" v-model="activeVariable">
                                <el-tab-pane :key="key" :name="key.toString()"
                                    v-for="(v, key) in qcResultHtml?.valuesComparsionResultsForVariables"
                                    :label="v.variable" />
                            </el-tabs>
                            <el-table :data="valueComparsionResultForVariables">
                                <el-table-column label="Obs" prop="obs" />
                                <el-table-column label="Base Value" prop="base" />
                                <el-table-column label="Compare Value" prop="compare" />
                            </el-table>
                        </el-card>
                    </el-space>
                </el-scrollbar>
            </el-main>
        </el-container>
    </el-scrollbar>
</template>

<style scoped>
.status-tag {
    width: 100%
}
</style>