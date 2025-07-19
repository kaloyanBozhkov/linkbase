import { Duration } from "luxon";

export const secondsToMillis = (seconds: number) =>
  Duration.fromObject({ seconds }).toMillis();

export const minutesToMillis = (minutes: number) =>
  Duration.fromObject({ minutes }).toMillis();

export const hoursToMillis = (hours: number) =>
  Duration.fromObject({ hours }).toMillis();

export const minutesToSeconds = (minutes: number) =>
  Duration.fromObject({ minutes }).as("seconds");

export const hoursToSeconds = (hours: number) =>
  Duration.fromObject({ hours }).as("seconds");

export const daysToSeconds = (days: number) =>
  Duration.fromObject({ days }).as("seconds");

export const daysToMillis = (days: number) =>
  Duration.fromObject({ days }).toMillis();

export const secondsToMMSS = (seconds: number) =>
  Duration.fromObject({ seconds }).toFormat("mm:ss");
