import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function HowItWorks() {
  const navigate = useNavigate();
  const [isDropFlow, setIsDropFlow] = useState(true);

  const dropSteps = [
    {
      title: "Step 1: Reservation",
      description: "The security guard or customer can reserve the locker by entering the phone number of the delivery executive."
    },
    {
      title: "Step 2: Receive OTP",
      description: "Upon receiving an OTP with both the pod ID, the delivery executive is instructed to locate the pod using the provided ID. After entering the OTP to gain access, the executive drops off the parcel inside the opened door and then closes it."
    },
    {
      title: "Step 3: Drop the Parcel",
      description: "Look for the pod with ID mentioned in the SMS, enter the OTP, drop the parcel in the opened door, and close the door."
    }
  ];

  const pickupSteps = [
    {
      title: "Step 1: Receive OTP",
      description: "Upon the initiation of the delivery process, the end user will receive an SMS containing the pod ID and OTP. The recipient is instructed to locate the designated pod using the provided ID and to take the parcel."
    },
    {
      title: "Step 2: Enter OTP",
      description: "Enter the OTP to gain access to the pod. Once the door opens, retrieve your parcel and ensure the door is securely closed afterwards."
    },
    {
      title: "Step 3: Pick up Parcel",
      description: "Upon receiving the SMS, locate the designated pod with the provided ID, enter the OTP, and take out the parcel from the opened door, then close it."
    }
  ];

  const currentSteps = isDropFlow ? dropSteps : pickupSteps;

  return (
    <div className="min-h-screen bg-qikpod-light-bg flex flex-col items-center p-4 py-[40px]">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-bold text-foreground mb-2 text-4xl">How to use the app</h1>
        </div>

        {/* YouTube Video */}
        <div className="mb-8">
          <div className="relative w-full h-0 pb-[56.25%] rounded-lg overflow-hidden shadow-lg">
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src="https://www.youtube.com/embed/QXzEqiA8RDg"
              title="How to use Qikpod"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>

        {/* Switch Toggle */}
        <Card className="card-modern p-6 mb-6">
          <div className="flex items-center justify-center space-x-4">
            <Label 
              htmlFor="flow-toggle" 
              className={`text-base font-medium cursor-pointer transition-colors ${
                isDropFlow ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              How to Drop the Parcel
            </Label>
            <Switch
              id="flow-toggle"
              checked={!isDropFlow}
              onCheckedChange={(checked) => setIsDropFlow(!checked)}
              className="scale-125"
            />
            <Label 
              htmlFor="flow-toggle" 
              className={`text-base font-medium cursor-pointer transition-colors ${
                !isDropFlow ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              How to Pick up the Parcel
            </Label>
          </div>
        </Card>

        {/* Steps Section */}
        <div className="space-y-4 mb-8">
          {currentSteps.map((step, index) => (
            <Card key={index} className="card-modern">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-primary">
                  {step.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Action */}
        <div className="text-center">
          <Button 
            onClick={() => navigate('/login')}
            className="btn-primary h-12 px-8 text-base font-semibold"
          >
            Let's Start
          </Button>
        </div>
      </div>
    </div>
  );
}