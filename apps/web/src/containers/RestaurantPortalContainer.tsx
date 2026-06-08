import { useState } from 'react';
import { Link } from 'react-router';
import * as Dialog from '@radix-ui/react-dialog';

import {
  useRestaurantOrders,
  useAccountInfo,
  useAdvanceOrderStatus,
  useMarkReadyForPickup,
  useCancelOrder,
  useRestaurant,
  useRestaurantDisputes,
  useUpdateRestaurant,
} from '../hooks';
import {
  RestaurantOrderCounters,
  RestaurantOrderList,
  RestaurantOrderDetailModal,
  groupOrdersByStatus,
  groupOrdersByDate,
  RestaurantProfileForm,
} from '../components';
import type { RestaurantProfileFormData } from '../components/RestaurantProfileForm';
import { resolveOrderItem, isDisputeWindowOpen } from '../lib';
import { DisputeStatus } from '../types';
import type { OrderStatus } from '../types';

import { RestaurantDisputesContainer } from './RestaurantDisputesContainer';
import { RaiseDisputeContainer } from './RaiseDisputeContainer';

const ADVANCE_LABELS: Partial<Record<OrderStatus, string>> = {
  PLACED: 'Confirm order',
  CONFIRMED: 'Preparing order',
  PREPARING: 'Order is ready for pickup',
};

const STATUS_BADGE_LABELS: Record<OrderStatus, string> = {
  PLACED: 'new',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY_FOR_PICKUP: 'ready for pickup',
  COMPLETED: 'completed',
  CANCELED: 'canceled',
};

export function RestaurantPortalContainer() {
  const { orders } = useRestaurantOrders();
  const { restaurantId } = useAccountInfo();
  const { advance } = useAdvanceOrderStatus();
  const { markReady } = useMarkReadyForPickup();
  const { cancel } = useCancelOrder();
  const { restaurant } = useRestaurant(restaurantId ?? '');
  const { disputes } = useRestaurantDisputes();
  const { updateRestaurant } = useUpdateRestaurant();

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'past' | 'disputes'>(
    'active',
  );
  const [pickupCode, setPickupCode] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Count open disputes for badge
  const openDisputeCount = disputes.filter(
    (d) => d.dispute.status === DisputeStatus.OPEN,
  ).length;

  const activeOrders = orders.filter(
    (o) => o.status !== 'COMPLETED' && o.status !== 'CANCELED',
  );
  const pastOrders = orders.filter(
    (o) => o.status === 'COMPLETED' || o.status === 'CANCELED',
  );

  const statusCounts = Object.entries(STATUS_BADGE_LABELS).map(
    ([status, label]) => ({
      label,
      count: orders.filter((o) => o.status === status).length,
    }),
  );

  const activeGroups = groupOrdersByStatus(activeOrders);
  const pastGroups = groupOrdersByDate(pastOrders);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) ?? null;
  const resolvedItems =
    selectedOrder && restaurant
      ? selectedOrder.items.map((item) => resolveOrderItem(item, restaurant))
      : [];

  const handleAdvance = async () => {
    if (selectedOrder) {
      setIsProcessing(true);
      try {
        // Use markReady for PREPARING -> READY_FOR_PICKUP (generates pickup code)
        if (selectedOrder.status === 'PREPARING') {
          const result = await markReady(selectedOrder.id);
          setPickupCode(result.displayCode);
          // Don't close modal - show the pickup code
        } else {
          await advance(selectedOrder.id);
          setSelectedOrderId(null);
        }
      } catch {
        setSelectedOrderId(null);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleCancel = async () => {
    if (selectedOrder) {
      try {
        await cancel(selectedOrder.id);
      } catch {
        // Error handling silently
      }

      setSelectedOrderId(null);
    }
  };

  const handleSaveSettings = async (data: RestaurantProfileFormData) => {
    setSettingsLoading(true);
    setSettingsError(null);

    try {
      await updateRestaurant({
        description: data.description,
        avatarFile: data.avatarFile,
      });
      setShowSettings(false);
    } catch (err) {
      setSettingsError(
        err instanceof Error ? err.message : 'Failed to update profile',
      );
    } finally {
      setSettingsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-text-primary">
          {restaurant?.name || 'Restaurant Portal'}
        </h1>
        <div className="flex gap-2">
          {restaurantId && (
            <Link
              to={`/restaurants/${restaurantId}`}
              className="rounded-lg border border-light-border bg-white px-4 py-2 text-sm font-medium text-text-secondary hover:bg-gray-50 transition-colors"
            >
              Preview
            </Link>
          )}
          <Link
            to="/restaurant-portal/menu"
            className="rounded-lg border border-light-border bg-white px-4 py-2 text-sm font-medium text-text-secondary hover:bg-gray-50 transition-colors"
          >
            Edit Menu
          </Link>
          <button
            onClick={() => setShowSettings(true)}
            className="rounded-lg border border-light-border bg-white px-4 py-2 text-sm font-medium text-text-secondary hover:bg-gray-50 transition-colors"
          >
            Settings
          </button>
        </div>
      </div>
      <RestaurantOrderCounters counts={statusCounts} />

      <div className="mt-6 flex gap-2">
        <button
          onClick={() => setActiveTab('active')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'active'
              ? 'bg-brand text-white'
              : 'bg-white text-text-secondary border border-light-border'
          }`}
        >
          Active orders
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'past'
              ? 'bg-brand text-white'
              : 'bg-white text-text-secondary border border-light-border'
          }`}
        >
          Past orders
        </button>
        <button
          onClick={() => setActiveTab('disputes')}
          className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'disputes'
              ? 'bg-brand text-white'
              : 'bg-white text-text-secondary border border-light-border'
          }`}
        >
          Disputes
          {openDisputeCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {openDisputeCount}
            </span>
          )}
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-6">
        {activeTab === 'active' && (
          <RestaurantOrderList
            groups={activeGroups}
            emptyMessage="No active orders"
            onOrderClick={setSelectedOrderId}
          />
        )}
        {activeTab === 'past' && (
          <RestaurantOrderList
            groups={pastGroups}
            emptyMessage="No past orders"
            onOrderClick={setSelectedOrderId}
          />
        )}
        {activeTab === 'disputes' && <RestaurantDisputesContainer />}
      </div>

      {selectedOrder && !showDisputeForm && (
        <RestaurantOrderDetailModal
          isOpen={true}
          onClose={() => {
            setSelectedOrderId(null);
            setPickupCode(null);
          }}
          order={selectedOrder}
          customerAddress={selectedOrder.customerId}
          resolvedItems={resolvedItems}
          advanceLabel={ADVANCE_LABELS[selectedOrder.status]}
          onAdvance={
            ADVANCE_LABELS[selectedOrder.status] ? handleAdvance : undefined
          }
          onCancel={handleCancel}
          canDispute={
            selectedOrder.status === 'COMPLETED' &&
            isDisputeWindowOpen(selectedOrder.completedAt) &&
            !selectedOrder.disputeId
          }
          onRaiseDispute={() => setShowDisputeForm(true)}
          pickupCode={pickupCode ?? undefined}
          isProcessing={isProcessing}
        />
      )}

      <Dialog.Root
        open={!!selectedOrder && showDisputeForm}
        onOpenChange={(open) => {
          if (!open) {
            setShowDisputeForm(false);
            setSelectedOrderId(null);
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content
            aria-describedby={undefined}
            className="fixed top-1/2 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-light-border bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
          >
            <Dialog.Title className="mb-4 text-xl font-bold text-text-primary">
              Raise Dispute for Order #{selectedOrder?.id}
            </Dialog.Title>
            {selectedOrder && (
              <RaiseDisputeContainer
                orderId={selectedOrder.id}
                initiator="restaurant"
                onCancel={() => {
                  setShowDisputeForm(false);
                  setSelectedOrderId(null);
                }}
              />
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={showSettings} onOpenChange={setShowSettings}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content
            aria-describedby={undefined}
            className="fixed top-1/2 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-light-border bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
          >
            <Dialog.Title className="mb-4 text-xl font-bold text-text-primary">
              Restaurant Settings
            </Dialog.Title>
            <RestaurantProfileForm
              initialDescription={restaurant?.description}
              initialAvatarUrl={restaurant?.avatarUrl}
              onSave={handleSaveSettings}
              onCancel={() => setShowSettings(false)}
              isLoading={settingsLoading}
              error={settingsError}
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
