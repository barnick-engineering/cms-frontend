import { useCallback } from "react";
import { toast } from "sonner";
import { getWorkOrderById } from "@/api/workOrderApi";
import { generateWorkOrderDeliveryChallanPDF } from "@/utils/enums/workOrderDeliveryChallanPdf";

export const useWorkOrderDeliveryChallan = () => {
    const generateDeliveryChallan = useCallback(
        async (workOrderId: string | number) => {
            try {
                const workOrderDetail = await getWorkOrderById(workOrderId);

                if (!workOrderDetail) {
                    toast.error("Failed to load work order details");
                    return;
                }

                await generateWorkOrderDeliveryChallanPDF(workOrderDetail);
                toast.success("Delivery challan downloaded successfully");
            } catch (error) {
                console.error("Error generating delivery challan:", error);
                toast.error(
                    "Failed to generate delivery challan. Please try again."
                );
            }
        },
        []
    );

    return { generateDeliveryChallan };
};
