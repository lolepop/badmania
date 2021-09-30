export interface Note
{
    lane: number;
    startTime: number;
    endTime?: number;
}

export interface Chart
{
    keys: number;
    notes: Note[];
}

export interface IChartParser
{
    fromString(obj: string): void;
    toChart(): Chart;
}
