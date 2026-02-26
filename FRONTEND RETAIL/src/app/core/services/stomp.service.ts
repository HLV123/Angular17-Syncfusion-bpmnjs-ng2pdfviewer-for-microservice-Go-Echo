import { Injectable, OnDestroy } from '@angular/core';
import { Observable, timer, Subject } from 'rxjs';
import { map, takeUntil, shareReplay } from 'rxjs/operators';
import { MockSocketService, SystemAlert } from './mock-socket.service';

/**
 * StompService — wraps @stomp/rx-stomp + sockjs-client for real-time messaging.
 *
 * In production, this connects to the backend's STOMP/WebSocket broker:
 *   - Apache Kafka → STOMP bridge (Spring Cloud Stream or custom Go+STOMP)
 *   - Topics: /topic/alerts, /topic/model-metrics, /topic/loan-updates, /topic/ews
 *   - SockJS fallback for environments without native WebSocket support
 *
 * Currently falls back to MockSocketService (timer-based RxJS) for frontend-only mode.
 *
 * Production activation:
 *   1. npm install @stomp/stompjs   (peer dependency of rx-stomp)
 *   2. Set this.connected = true after RxStomp.activate()
 *   3. Topics will use real Kafka → STOMP bridge messages
 */
@Injectable({ providedIn: 'root' })
export class StompService implements OnDestroy {
    private rxStomp: any = null;
    private connected = false;
    private destroy$ = new Subject<void>();

    // STOMP broker config (production values)
    private stompConfig = {
        brokerURL: 'ws://localhost:15674/ws',
        connectHeaders: { login: 'cdss', passcode: 'cdss' },
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        reconnectDelay: 5000,
    };

    constructor(private mockSocket: MockSocketService) {
        // In production: activate RxStomp here
        // import { RxStomp } from '@stomp/rx-stomp';
        // this.rxStomp = new RxStomp();
        // this.rxStomp.configure(this.stompConfig);
        // this.rxStomp.activate();
        // this.connected = true;
        console.log('[StompService] Using MockSocketService fallback (no backend).');
    }

    /**
     * Subscribe to real-time system alerts.
     * Topic: /topic/alerts  |  Source: Kafka → STOMP bridge
     */
    getAlerts(): Observable<SystemAlert> {
        if (this.connected && this.rxStomp) {
            return this.rxStomp.watch('/topic/alerts').pipe(
                map((msg: any) => JSON.parse(msg.body) as SystemAlert),
                takeUntil(this.destroy$)
            );
        }
        return this.mockSocket.getAlertStream().pipe(takeUntil(this.destroy$));
    }

    /**
     * Subscribe to model monitoring metrics.
     * Topic: /topic/model-metrics  |  Source: Prometheus → Kafka → STOMP
     */
    getModelMetrics(): Observable<any> {
        if (this.connected && this.rxStomp) {
            return this.rxStomp.watch('/topic/model-metrics').pipe(
                map((msg: any) => JSON.parse(msg.body)),
                takeUntil(this.destroy$)
            );
        }
        return this.mockSocket.getMetricStream().pipe(takeUntil(this.destroy$));
    }

    /**
     * Subscribe to loan status updates.
     * Topic: /topic/loan-updates  |  Source: Kafka topic 'loan-events'
     */
    getLoanUpdates(): Observable<{ loanId: string; status: string; actor: string; timestamp: string }> {
        if (this.connected && this.rxStomp) {
            return this.rxStomp.watch('/topic/loan-updates').pipe(
                map((msg: any) => JSON.parse(msg.body)),
                takeUntil(this.destroy$)
            );
        }
        return timer(8000, 20000).pipe(
            map(i => ({
                loanId: `LV-${2435 + (i % 8)}`,
                status: ['AI_SCORING', 'REVIEWING', 'APPROVED', 'CONDITIONALLY_APPROVED'][i % 4],
                actor: ['Hệ thống', 'AI Engine', 'officer_le', 'manager_tran'][i % 4],
                timestamp: new Date().toISOString()
            })),
            takeUntil(this.destroy$),
            shareReplay(1)
        );
    }

    /**
     * Subscribe to EWS (Early Warning System) alerts.
     * Topic: /topic/ews  |  Source: EWS Engine → Kafka
     */
    getEWSUpdates(): Observable<any> {
        if (this.connected && this.rxStomp) {
            return this.rxStomp.watch('/topic/ews').pipe(
                map((msg: any) => JSON.parse(msg.body)),
                takeUntil(this.destroy$)
            );
        }
        return timer(10000, 30000).pipe(
            map(i => ({
                customerId: `KH00${(i % 10) + 1}`,
                alertType: ['Payment Degradation', 'Income Drop', 'Over-leverage', 'Industry Risk'][i % 4],
                severity: i % 3 === 0 ? 'HIGH' : 'MEDIUM',
                timestamp: new Date().toISOString()
            })),
            takeUntil(this.destroy$)
        );
    }

    isConnected(): boolean {
        return this.connected;
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        if (this.rxStomp) {
            this.rxStomp.deactivate();
        }
    }
}
