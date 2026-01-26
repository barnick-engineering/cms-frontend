import { useCallback } from "react";
import { toast } from "sonner";
import { getWorkOrderById } from "@/api/workOrderApi";
import { generateWorkOrderInvoicePDF } from "@/utils/enums/workOrderInvoicePdf";

export const useWorkOrderInvoice = () => {
    const generateInvoice = useCallback(
        async (workOrderId: string | number) => {
            try {
                // Fetch work order details
                const workOrderDetail = await getWorkOrderById(workOrderId);

                if (!workOrderDetail) {
                    toast.error("Failed to load work order details");
                    return;
                }

                // Generate and download PDF (now async)
                await generateWorkOrderInvoicePDF(workOrderDetail);
                toast.success("Invoice downloaded successfully");
            } catch (error) {
                console.error("Error generating invoice:", error);
                toast.error("Failed to generate invoice. Please try again.");
            }
        },
        []
    );

    return { generateInvoice };
};
