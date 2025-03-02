const express = require('express');
const { createServer } = require('@vercel/node');

const app = express()

app.use(express.json())

app.get('/cds-services', (req, res) => {
    res.send(
        {
            services: [
                {
                    hook: 'patient-view',
                    title: 'Predictive AI Service',
                    description: 'Provides AI-powered queue optimization, preventive care, and cost reduction analysis.',
                    id: '0001',
                    prefetch: {
                        patient: 'Patient/{{context.patientId}}',
                        conditions: 'Condition?patient={{context.patientId}}',
                        observations: 'Observation?patient={{context.patientId}}',
                        medications: 'MedicationRequest?patient={{context.patientId}}',
                        procedures: 'Procedure?patient={{context.patientId}}',
                        claims: 'Claim?patient={{context.patientId}}'
                    }
                }
            ]
        }
    )
})

// TODO: Analyze user's conditions
app.post('/cds-services/:id', (req, res) => {
    // console.log('id', req.params.id);
    // console.log('body', JSON.stringify(req.body, null, 2));

    if (req.params.id === '0001') {
        // application logic

        const patient = req.body.prefetch.patient;
        const conditions = req.body.prefetch.conditions || [];
        console.log('conditions', conditions);
        // console.log('conditions', conditions);
        // const observationsBundle = req.body.prefetch.observations || { entry: [] };
        // const observations = observationsBundle.entry.map(entry => entry.resource);
        // const cholesterolObs = observations.find(obs => 
        //     obs.code?.text?.toLowerCase().includes('cholesterol')
        //   );
        // const bloodPressureObs = observations.find(obs => 
        // obs.code?.text?.toLowerCase().includes('blood pressure')
        // );

        // console.log('observations', observations);
        // const medications = req.body.prefetch.medications || [];
        // console.log('medications', medications);
        // const procedures = req.body.prefetch.procedures || [];
        // console.log('procedures', procedures);
        // const claims = req.body.prefetch.claims || [];
        // console.log('claims', claims);

        //const bloodPressure = observations.find(obs => obs.code.text.includes('Blood Pressure')) || {};
        //  console.log(bloodPressure);
        // conditions if high blood preassure example. Show warning can or not, etc. Way to classify this.

        // const cholesterolValue = cholesterolObs?.valueQuantity?.value || 'N/A';
        // console.log('cholesterolValue', cholesterolValue);
        // const bloodPressureValue = bloodPressureObs?.valueQuantity?.value || 'N/A';
        // console.log('bloodPressureValue', bloodPressureValue);

        
        const name = patient.name[0].given[0] + ' ' + patient.name[0].family
        // console.log(JSON.stringify(name));
        res.json({
            cards: [
                {
                    summary: `AI Insights for ${name}`,
                    // detail: `Health Data: BP: ${bloodPressureValue}, Cholesterol: ${cholesterolValue}`,
                    indicator: 'info',
                    source: {
                        label: 'AI Health Insights'
                    },
                    links: [
                        {
                            label: 'View in App',
                            url: 'https://meld-rx-predictive-ai-application.vercel.app/launch',
                            type: 'smart'
                        }
                    ]
                }
            ]
        })
    }
})

// app.listen(4433, () => console.log('started!')) // for local testing only

// for vercel
module.exports = createServer(app);
