import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, StatusBar, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const JobDetailScreen = ({ jobId, onBack }) => {
    const [jobDetails, setJobDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('https://testapi.getlokalapp.com/common/jobs?page=1')
            .then(res => res.json())
            .then(data => {
                const job = data.results.find(job => job.id === jobId);
                setJobDetails(job);
                setIsLoading(false);
            })
            .catch(error => {
                console.error(error);
                setIsLoading(false);
            });
    }, [jobId]);

    const handleCall = () => {
        if (jobDetails?.custom_link) {
            Linking.openURL(jobDetails.custom_link);
        }
    };

    const handleWhatsApp = () => {
        if (jobDetails?.contact_preference?.whatsapp_link) {
            Linking.openURL(jobDetails.contact_preference.whatsapp_link);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderDetailItem = (icon, label, value) => (
        <View style={styles.detailItem} key={label}>
            <View style={styles.detailRow}>
                <Ionicons name={icon} size={16} color="rgba(255,255,255,0.6)" />
                <Text style={styles.detailLabel}>{label}</Text>
            </View>
            <Text style={styles.detailValue}>{value || 'Not specified'}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#1a1a2e', '#16213e', '#0f3460']}
                style={StyleSheet.absoluteFill}
            />
            <View style={styles.header}>
                <Pressable onPress={onBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </Pressable>
                <Text style={styles.headerText}>Job Details</Text>
                {jobDetails?.is_premium && (
                    <Ionicons name="star" size={24} color="#FFD700" style={styles.premiumIcon} />
                )}
            </View>
            
            {isLoading ? (
                <Text style={styles.text}>Loading...</Text>
            ) : jobDetails ? (
                <ScrollView style={styles.content}>
                    <View style={styles.card}>
                        {/* Header Section */}
                        <View style={styles.titleSection}>
                            <Text style={styles.jobId}>Job ID: {jobDetails.id}</Text>
                            <Text style={styles.title}>{jobDetails.title}</Text>
                            <Text style={styles.company}>{jobDetails.company_name}</Text>
                            
                            <View style={styles.tagContainer}>
                                {jobDetails.job_tags?.map((tag, index) => (
                                    <View key={index} style={[styles.tag, { backgroundColor: tag.bg_color }]}>
                                        <Text style={[styles.tagText, { color: tag.text_color }]}>{tag.value}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Key Details Section */}
                        <View style={styles.keyDetailsSection}>
                            {renderDetailItem('cash-outline', 'Salary', jobDetails.primary_details?.Salary)}
                            {renderDetailItem('location-outline', 'Location', jobDetails.primary_details?.Place)}
                            {renderDetailItem('business-outline', 'Job Type', jobDetails.job_hours)}
                            {renderDetailItem('people-outline', 'Openings', `${jobDetails.openings_count} positions`)}
                            {renderDetailItem('wallet-outline', 'Amount', `₹${jobDetails.amount}`)}
                            {jobDetails.fee_details?.V3?.length > 0 && renderDetailItem('cash-outline', 'Fee Details', jobDetails.fee_details.V3.join(', '))}
                        </View>

                        {/* Description Section */}
                        <View style={styles.descriptionSection}>
                            <Text style={styles.sectionTitle}>Job Description</Text>
                            <Text style={styles.description}>{jobDetails.other_details}</Text>
                        </View>

                        {/* Requirements Section */}
                        <View style={styles.requirementsSection}>
                            <Text style={styles.sectionTitle}>Requirements</Text>
                            {renderDetailItem('school-outline', 'Qualification', jobDetails.primary_details?.Qualification)}
                            {renderDetailItem('time-outline', 'Experience', jobDetails.primary_details?.Experience)}
                            {renderDetailItem('briefcase-outline', 'Role', jobDetails.job_role)}
                            {renderDetailItem('business-outline', 'Category', jobDetails.job_category)}
                        </View>

                        {/* Additional Details Section */}
                        <View style={styles.additionalSection}>
                            <Text style={styles.sectionTitle}>Additional Information</Text>
                            {jobDetails.contentV3?.V3?.map((content, index) => (
                                renderDetailItem('information-circle-outline', content.field_name, content.field_value)
                            ))}
                        </View>

                        {/* Stats Section */}
                        <View style={styles.statsSection}>
                            <View style={styles.statItem}>
                                <Ionicons name="eye-outline" size={20} color="#fff" />
                                <Text style={styles.statText}>{jobDetails.views} Views</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Ionicons name="people-outline" size={20} color="#fff" />
                                <Text style={styles.statText}>{jobDetails.num_applications} Applications</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Ionicons name="share-social-outline" size={20} color="#fff" />
                                <Text style={styles.statText}>{jobDetails.shares + jobDetails.fb_shares} Shares</Text>
                            </View>
                        </View>

                        {/* Contact Section */}
                        <View style={styles.contactSection}>
                            <Pressable style={styles.contactButton} onPress={handleCall}>
                                <Ionicons name="call-outline" size={20} color="#fff" />
                                <Text style={styles.buttonText}>{jobDetails.button_text}</Text>
                            </Pressable>
                            {jobDetails.whatsapp_no && (
                                <Pressable style={styles.contactButton} onPress={handleWhatsApp}>
                                    <Ionicons name="logo-whatsapp" size={20} color="#fff" />
                                    <Text style={styles.buttonText}>WhatsApp HR</Text>
                                </Pressable>
                            )}
                        </View>

                        {/* Call Time Preference */}
                        {jobDetails.contact_preference?.preferred_call_start_time && (
                            <View style={styles.callPreference}>
                                <Text style={styles.callPreferenceText}>
                                    Preferred call time: {jobDetails.contact_preference.preferred_call_start_time} - {jobDetails.contact_preference.preferred_call_end_time}
                                </Text>
                            </View>
                        )}

                        {/* Footer Info */}
                        <View style={styles.footerSection}>
                            <Text style={styles.footerText}>
                                Posted: {formatDate(jobDetails.created_on)}
                            </Text>
                            <Text style={styles.footerText}>
                                Last Updated: {formatDate(jobDetails.updated_on)}
                            </Text>
                            <Text style={styles.footerText}>
                                Expires: {formatDate(jobDetails.expire_on)}
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            ) : (
                <Text style={styles.text}>Job not found</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 16 : 16,
    },
    backButton: {
        padding: 8,
    },
    headerText: {
        flex: 1,
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginLeft: 16,
    },
    premiumIcon: {
        marginLeft: 8,
    },
    content: {
        flex: 1,
    },
    card: {
        margin: 16,
        padding: 20,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    titleSection: {
        marginBottom: 20,
    },
    jobId: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        marginBottom: 8,
    },
    title: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    company: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 18,
        marginBottom: 16,
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
    },
    tag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginRight: 8,
        marginBottom: 8,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '600',
    },
    keyDetailsSection: {
        marginBottom: 24,
    },
    descriptionSection: {
        marginBottom: 24,
    },
    requirementsSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    description: {
        color: '#fff',
        fontSize: 16,
        lineHeight: 24,
    },
    detailItem: {
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    detailLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        marginLeft: 8,
    },
    detailValue: {
        color: '#fff',
        fontSize: 16,
        marginLeft: 24,
        marginTop: 4,
    },
    statsSection: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        marginBottom: 24,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    statText: {
        color: '#fff',
        marginLeft: 8,
    },
    contactSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    contactButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#8a6ef0',
        padding: 12,
        borderRadius: 8,
        marginHorizontal: 8,
    },
    buttonText: {
        color: '#fff',
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
    },
    footerSection: {
        borderTopWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        paddingTop: 16,
    },
    footerText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        marginBottom: 4,
    },
    additionalSection: {
        marginBottom: 24,
    },
    callPreference: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    callPreferenceText: {
        color: '#fff',
        fontSize: 14,
        textAlign: 'center',
    },
});

export default JobDetailScreen; 