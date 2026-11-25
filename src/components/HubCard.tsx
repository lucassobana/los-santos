'use client';

import React from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  Icon,
} from '@chakra-ui/react';
import Link from 'next/link';
import { IconType } from 'react-icons';
import { FiArrowRight } from 'react-icons/fi';

interface HubCardProps {
  title: string;
  subtitle: string;
  description: string;
  href: string;
  icon: IconType;
  accentColor: string;
  gradient: string;
  tag: string;
  buttonText: string;
}

export default function HubCard({
  title,
  subtitle,
  description,
  href,
  icon,
  accentColor,
  gradient,
  tag,
  buttonText,
}: HubCardProps) {
  const bg = '#161922';
  const borderColor = '#232936';

  return (
    <Box
      position="relative"
      bg={bg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius={{ base: '2xl', md: '3xl' }}
      p={{ base: 5, sm: 6, md: 8 }}
      overflow="hidden"
      transition="all 0.35s cubic-bezier(0.4, 0, 0.2, 1)"
      _hover={{
        transform: 'translateY(-6px)',
        boxShadow: `0 20px 40px ${accentColor}25`,
        borderColor: accentColor,
      }}
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      h="100%"
    >
      {/* Top subtle glow background */}
      <Box
        position="absolute"
        top="-50px"
        right="-50px"
        w="160px"
        h="160px"
        borderRadius="full"
        bg={accentColor}
        opacity={0.12}
        filter="blur(50px)"
        pointerEvents="none"
      />

      <VStack align="start" spacing={{ base: 4, md: 5 }}>
        <HStack justify="space-between" w="100%">
          <Box
            p={{ base: 3, md: 3.5 }}
            borderRadius="2xl"
            bgGradient={gradient}
            color="white"
            boxShadow={`0 8px 20px ${accentColor}40`}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon as={icon} boxSize={{ base: 5, md: 6 }} />
          </Box>
          <Badge
            variant="subtle"
            borderRadius="full"
            px={2.5}
            py={0.5}
            fontSize="2xs"
            fontWeight="700"
            color={accentColor}
            bg={`${accentColor}18`}
            border="1px solid"
            borderColor={`${accentColor}30`}
          >
            {tag}
          </Badge>
        </HStack>

        <Box>
          <Text fontSize="2xs" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="wider">
            {subtitle}
          </Text>
          <Heading as="h3" size={{ base: 'md', sm: 'lg' }} mt={1} fontWeight="800">
            {title}
          </Heading>
          <Text fontSize="sm" color="gray.400" mt={{ base: 2, md: 3 }} lineHeight="relaxed">
            {description}
          </Text>
        </Box>
      </VStack>

      <Box pt={{ base: 6, md: 8 }}>
        <Link href={href} style={{ width: '100%' }}>
          <Button
            w="100%"
            size={{ base: 'md', md: 'lg' }}
            bgGradient={gradient}
            color="white"
            rightIcon={<FiArrowRight />}
            borderRadius="xl"
            fontWeight="700"
            _hover={{
              opacity: 0.92,
              transform: 'translateX(3px)',
              boxShadow: `0 8px 25px ${accentColor}45`,
            }}
            transition="all 0.25s ease"
          >
            {buttonText}
          </Button>
        </Link>
      </Box>
    </Box>
  );
}
