export type ScheduleRequest = { id: number; socketRevision: number };

/** Tracks data freshness independently from HTTP request completion. */
export class ScheduleFreshness {
  private requestId = 0;
  private socketRevision = 0;

  startRequest(): ScheduleRequest {
    return { id: ++this.requestId, socketRevision: this.socketRevision };
  }

  recordSocketUpdate(): void {
    this.socketRevision += 1;
  }

  invalidateRequests(): void {
    this.requestId += 1;
  }

  canComplete(request: ScheduleRequest): boolean {
    return request.id === this.requestId;
  }

  canApplyResponse(request: ScheduleRequest): boolean {
    return this.canComplete(request) &&
      request.socketRevision === this.socketRevision;
  }
}
