import * as React from 'react';
import { Box, Paper, TextField, Typography } from '@mui/material';
import { CheckCircleOutline } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { toast } from 'react-toastify';

import { PageContentHeader } from '@/components/page-content-header';
import { getCertificateContract } from '@/blockchain/certificate-registry';

export const VerifyCertificatePage: React.FC = () => {
  const [certId, setCertId] = React.useState('');
  const [studentId, setStudentId] = React.useState('');
  const [cid, setCid] = React.useState('');
  const [result, setResult] = React.useState<null | boolean>(null);
  const [isVerifying, setIsVerifying] = React.useState(false);

const handleVerify = async () => {
  try {
    setIsVerifying(true);
    setResult(null);

    const contract = await getCertificateContract();

    let isValid = false;

    try {
      isValid = await contract.verifyCertificate(
        Number(certId),
        Number(studentId),
        cid
      );
    } catch (e) {
      isValid = false;
    }

    setResult(isValid);
  } catch (error: any) {
    console.error(error);
    toast.error(error?.message ?? 'Error verifying certificate.');
  } finally {
    setIsVerifying(false);
  }
};


  return (
    <>
      <PageContentHeader
        title='Verify On-chain Certificate'
        icon={<CheckCircleOutline />}
        actions={[]}
      />
      <Box component={Paper} sx={{ p: 3, maxWidth: 480 }}>
        <Box sx={{ display: 'grid', gap: 2 }}>
          <TextField
            label='Certificate ID'
            value={certId}
            onChange={(e) => setCertId(e.target.value)}
          />
          <TextField
            label='Student ID'
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          />
          <TextField
            label='CID code used in issuing the code.'
            value={cid}
            onChange={(e) => setCid(e.target.value)}
            helperText='Use the exact same CID/string used in the emission.'
          />

          <LoadingButton
            variant='contained'
            loading={isVerifying}
            onClick={handleVerify}
          >
            Verificar
          </LoadingButton>

          {result !== null && (
            <Typography
              variant='body1'
              color={result ? 'success.main' : 'error.main'}
              fontWeight={600}
            >
              {result ? 'Valid Certificate ✅' : 'Invalid or revoked certificate. ❌'}
            </Typography>
          )}
        </Box>
      </Box>
    </>
  );
};
